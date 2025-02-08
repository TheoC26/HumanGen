export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">About HumanGen</h1>
        
        <div className="prose prose-lg">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">What is HumanGen?</h2>
            <p className="text-gray-700 mb-4">
              HumanGen is a unique social art experiment that brings together human creativity and artificial intelligence. 
              Each day, AI generates a creative prompt and a carefully curated color palette, inviting artists to interpret 
              and create artwork within these parameters.
            </p>
            <p className="text-gray-700">
              Unlike traditional AI art platforms where machines generate the artwork, HumanGen celebrates human creativity 
              and interpretation. The AI serves only as a curator and facilitator, providing inspiration through prompts 
              and color suggestions, while humans remain the true artists.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-medium text-lg mb-2">1. Daily Prompts</h3>
                <p className="text-gray-600">
                  Every day at midnight, our AI generates a new creative prompt and a set of six colors. These serve as 
                  the foundation for that day's artistic exploration.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-medium text-lg mb-2">2. Human Creation</h3>
                <p className="text-gray-600">
                  Artists use our digital canvas to create artwork inspired by the prompt, using the provided color palette. 
                  The constraint of using specific colors adds an interesting challenge and unity to each day's collection.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-medium text-lg mb-2">3. Community Gallery</h3>
                <p className="text-gray-600">
                  All artworks are displayed in our gallery, creating a unique daily collection that showcases different 
                  interpretations of the same prompt. Previous days' collections are preserved in our archive.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Our Purpose</h2>
            <p className="text-gray-700 mb-4">
              In an era where AI-generated art is becoming increasingly prevalent, HumanGen stands as a celebration of 
              human creativity. We believe that while AI can be a powerful tool for inspiration and facilitation, the 
              most meaningful art comes from human expression and interpretation.
            </p>
            <p className="text-gray-700">
              By providing a structured yet open-ended creative environment, we aim to:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-700">
              <li>Encourage daily creative expression</li>
              <li>Create a supportive community of artists</li>
              <li>Showcase the diversity of human interpretation</li>
              <li>Demonstrate how AI can enhance rather than replace human creativity</li>
              <li>Create a unique historical record of collective creativity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Join Us</h2>
            <p className="text-gray-700">
              Whether you're a professional artist or just someone who enjoys doodling, HumanGen is open to all. 
              Each day brings a new opportunity to interpret, create, and share. Join our growing community and 
              be part of this unique artistic journey where human creativity meets AI inspiration.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
} 