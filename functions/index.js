const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { OpenAI } = require('openai');

admin.initializeApp();

// Initialize OpenAI with the config
const openai = new OpenAI({
  apiKey: functions.config().openai.key,
});

const SYSTEM_COLLECTION = 'system';
const PROMPTS_COLLECTION = 'prompts';

// List of admin emails
const ADMIN_EMAILS = [
  'theo.htf.chan@gmail.com', // Add your email here
];

// Generate a new prompt and colors using OpenAI
async function generatePromptAndColors() {
  // First, get the prompt
  const promptResponse = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a creative art prompt generator. Generate a single creative, inspiring, and open-ended prompt for artists to draw. The prompt should be concise (1-2 sentences) and encourage creativity and interpretation. This should be a description of a drawing, and should NOT inlude the words "Draw", "Create", etc.',
      },
      {
        role: 'user',
        content: 'Generate a creative art prompt.',
      },
    ],
    max_tokens: 100,
    temperature: 0.8,
  });

  const promptText = promptResponse.choices[0].message.content.trim();

  // Then, get color suggestions based on the prompt
  const colorResponse = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a color palette generator. Based on the given prompt, suggest 6 hex colors (excluding black) that would work well for creating artwork matching this prompt. Return ONLY a JSON array of 6 hex color codes.',
      },
      {
        role: 'user',
        content: `Generate 6 hex colors for this art prompt: "${promptText}"`,
      },
    ],
    max_tokens: 100,
    temperature: 0.6,
  });

  let colors;
  try {
    colors = JSON.parse(colorResponse.choices[0].message.content.trim());
    // Validate that we got exactly 6 hex colors
    if (!Array.isArray(colors) || colors.length !== 6 || !colors.every(color => /^#[0-9A-F]{6}$/i.test(color))) {
      throw new Error('Invalid color format');
    }
  } catch (error) {
    console.error('Error parsing colors, using defaults:', error);
    colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
  }

  return {
    prompt: promptText,
    colors: colors,
  };
}

// Daily prompt generation function
exports.generateDailyPrompt = functions.pubsub
  .schedule("0 0 * * *") // Run at midnight every day
  .timeZone("America/New_York")
  .onRun(async (context) => {
    try {
      const now = admin.firestore.Timestamp.now();
      // Set end date to next day at midnight
      const endDate = new Date(now.toDate().getTime() + 24 * 60 * 60 * 1000);
      endDate.setHours(0, 0, 0, 0);

      // Generate new prompt and colors
      const { prompt, colors } = await generatePromptAndColors();

      // Add prompt to Firestore
      await admin
        .firestore()
        .collection(SYSTEM_COLLECTION)
        .doc("daily")
        .collection(PROMPTS_COLLECTION)
        .add({
          prompt: prompt,
          colors: colors,
          startDate: now,
          endDate: admin.firestore.Timestamp.fromDate(endDate),
          createdAt: now,
        });

      console.log("Daily prompt generated:", prompt);
      console.log("Colors generated:", colors);
      return null;
    } catch (error) {
      console.error("Error generating daily prompt:", error);
      throw error;
    }
  });

// Manual prompt generation endpoint (for testing)
exports.generatePromptManually = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to generate prompts'
    );
  }

  // Check if user's email is in the admin list
  if (!ADMIN_EMAILS.includes(context.auth.token.email)) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admin users can generate prompts manually'
    );
  }

  try {
    const now = admin.firestore.Timestamp.now();
    // Set end date to next day at midnight
    const endDate = new Date(now.toDate().getTime() + 24 * 60 * 60 * 1000);
    endDate.setHours(0, 0, 0, 0);

    // Generate new prompt and colors
    const { prompt, colors } = await generatePromptAndColors();

    // Add prompt to Firestore
    const promptRef = await admin
      .firestore()
      .collection(SYSTEM_COLLECTION)
      .doc('daily')
      .collection(PROMPTS_COLLECTION)
      .add({
        prompt: prompt,
        colors: colors,
        startDate: now,
        endDate: admin.firestore.Timestamp.fromDate(endDate),
        createdAt: now,
      });

    return {
      id: promptRef.id,
      prompt: prompt,
      colors: colors,
      startDate: now,
      endDate: admin.firestore.Timestamp.fromDate(endDate),
    };
  } catch (error) {
    console.error('Error generating prompt manually:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
}); 