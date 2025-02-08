import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy,
  limit,
  doc,
  updateDoc,
  increment,
  arrayUnion,
  getDoc,
  arrayRemove,
} from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { db, auth } from "@/firebase";
import { getCurrentPrompt } from "./prompts";

// Collection names
const ARTWORKS_COLLECTION = "artworks";
const USERS_COLLECTION = "users";

// Get or create anonymous user
export const getOrCreateAnonymousUser = async () => {
  try {
    // Sign in anonymously if not already signed in
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }

    // Check if user document exists
    const userQuery = query(
      collection(db, USERS_COLLECTION),
      where("uid", "==", auth.currentUser.uid)
    );
    const userDocs = await getDocs(userQuery);

    if (userDocs.empty) {
      // Create new user document
      const userDoc = await addDoc(collection(db, USERS_COLLECTION), {
        uid: auth.currentUser.uid,
        createdAt: Timestamp.now(),
        submissionCount: 0,
        lastSubmission: null,
      });
      return { user: auth.currentUser, userDocId: userDoc.id };
    }

    return { user: auth.currentUser, userDocId: userDocs.docs[0].id };
  } catch (error) {
    console.error("Error in getOrCreateAnonymousUser:", error);
    throw error;
  }
};

// Check if user can submit artwork (daily limit)
export const canUserSubmitArtwork = async (uid) => {
  try {
    const userQuery = query(
      collection(db, USERS_COLLECTION),
      where("uid", "==", uid)
    );
    const userDocs = await getDocs(userQuery);

    if (userDocs.empty) return true;

    const userData = userDocs.docs[0].data();
    const lastSubmission = userData.lastSubmission?.toDate();

    if (!lastSubmission) return true;

    // Check if last submission was on a different day
    const today = new Date();
    return (
      today.getDate() !== lastSubmission.getDate() ||
      today.getMonth() !== lastSubmission.getMonth() ||
      today.getFullYear() !== lastSubmission.getFullYear()
    );
  } catch (error) {
    console.error("Error in canUserSubmitArtwork:", error);
    throw error;
  }
};

export const userHasSubmittedAlready = async () => {
  try {
    const { user } = await getOrCreateAnonymousUser();

    // Check submission limit
    return (canSubmit = await canUserSubmitArtwork(user.uid));
  } catch {
    console.log("error");
    return false;
  }
};

// Submit artwork
export const submitArtwork = async (imageData, prompt) => {
  try {
    const { user, userDocId } = await getOrCreateAnonymousUser();

    // Check submission limit
    const canSubmit = await canUserSubmitArtwork(user.uid);
    if (!canSubmit) {
      throw new Error("Daily submission limit reached");
    }

    // Add artwork document
    const artworkDoc = await addDoc(collection(db, ARTWORKS_COLLECTION), {
      userId: user.uid,
      imageData,
      prompt,
      createdAt: Timestamp.now(),
      likes: 0,
      likedBy: [],
    });

    // Update user's submission count and last submission time
    const userDocRef = doc(db, USERS_COLLECTION, userDocId);
    await updateDoc(userDocRef, {
      submissionCount:
        (
          await getDocs(
            query(
              collection(db, USERS_COLLECTION),
              where("uid", "==", user.uid)
            )
          )
        ).docs[0].data().submissionCount + 1,
      lastSubmission: Timestamp.now(),
    });

    return artworkDoc.id;
  } catch (error) {
    console.error("Error in submitArtwork:", error);
    throw error;
  }
};

// Toggle like on artwork
export const toggleLikeArtwork = async (artworkId) => {
  try {
    const { user } = await getOrCreateAnonymousUser();
    
    const artworkRef = doc(db, ARTWORKS_COLLECTION, artworkId);
    const artworkDoc = await getDoc(artworkRef);
    
    if (!artworkDoc.exists()) {
      throw new Error("Artwork not found");
    }

    const artworkData = artworkDoc.data();
    const hasLiked = artworkData.likedBy.includes(user.uid);

    // Update likes atomically
    await updateDoc(artworkRef, {
      likes: increment(hasLiked ? -1 : 1),
      likedBy: hasLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
    });

    return {
      likes: artworkData.likes + (hasLiked ? -1 : 1),
      hasLiked: !hasLiked
    };
  } catch (error) {
    console.error("Error in toggleLikeArtwork:", error);
    throw error;
  }
};

// Get recent artworks (only from current day)
export const getRecentArtworks = async () => {
  try {
    const { user } = await getOrCreateAnonymousUser();
    const currentPrompt = await getCurrentPrompt();
    
    const artworksQuery = query(
      collection(db, ARTWORKS_COLLECTION),
      where("prompt", "==", currentPrompt.prompt),
      orderBy("likes", "desc"),
      orderBy("createdAt", "desc")
    );
    
    const artworkDocs = await getDocs(artworksQuery);
    return artworkDocs.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      hasLiked: doc.data().likedBy?.includes(user.uid) || false
    }));
  } catch (error) {
    console.error("Error in getRecentArtworks:", error);
    throw error;
  }
};

// Get artworks by prompt
export const getArtworksByPrompt = async (prompt) => {
  try {
    const { user } = await getOrCreateAnonymousUser();
    const artworksQuery = query(
      collection(db, ARTWORKS_COLLECTION),
      where("prompt", "==", prompt),
      orderBy("likes", "desc"),
      orderBy("createdAt", "desc")
    );
    
    const artworkDocs = await getDocs(artworksQuery);
    return artworkDocs.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      hasLiked: doc.data().likedBy?.includes(user.uid) || false
    }));
  } catch (error) {
    console.error("Error in getArtworksByPrompt:", error);
    throw error;
  }
};
