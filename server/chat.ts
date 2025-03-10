import type { Request, Response } from 'express';

// City-specific mock responses organized by categories
const MOCK_RESPONSES: { [key: string]: { [category: string]: string[] } } = {
  "Mexico City": {
    restaurants: [
      "The best restaurants in Mexico City include: Pujol in Polanco for fine dining Mexican cuisine, Máximo Bistrot in Roma for seasonal farm-to-table, Contramar in Roma Norte for seafood, and El Pescadito in Condesa for fish tacos.",
      "For authentic Mexican street food, try El Turix in Polanco for cochinita pibil, El Huequito for Al Pastor tacos, and El Califa for late-night tacos.",
      "Don't miss the trendy restaurants in Roma Norte like Rosetta for Italian-Mexican fusion, Lardo for Mediterranean, and Cicatriz Café for healthy brunch options."
    ],
    workspaces: [
      "Best places to work in Mexico City: Público Café and Café Nin in Roma Norte offer fast wifi and great coffee. WeWork Insurgentes has amazing facilities in a central location.",
      "Panadería Rosetta in Roma Norte and Blend Station in Condesa are perfect for remote work with their quiet atmospheres and reliable internet.",
      "Chiquitito Café in Roma Norte and Cardinal Casa de Café in Juárez are cozy spots with excellent coffee and good wifi for working."
    ],
    neighborhoods: [
      "Roma Norte and Condesa are the best neighborhoods for digital nomads, offering a perfect blend of cafes, restaurants, and parks.",
      "Polanco is Mexico City's upscale area with luxury shopping and fine dining, while Juárez offers a more local experience with great value.",
      "For a bohemian vibe, check out La Roma Sur, or stay in Hipódromo for its tree-lined streets and proximity to Parque México."
    ],
    attractions: [
      "Must-see attractions: Visit the ancient Teotihuacan pyramids, explore the Frida Kahlo Museum in Coyoacán, and wander through the historic Centro Histórico.",
      "Don't miss the Sunday art market in San Angel, the floating gardens of Xochimilco, and the modern art at Museo Jumex.",
      "The Anthropology Museum in Chapultepec Park is world-class, and the Palacio de Bellas Artes hosts incredible cultural performances."
    ],
    daytrips: [
      "Take a day trip to Tepoztlán, a magical town known for its mystical mountain and traditional market, just 1.5 hours from the city.",
      "Visit Puebla and Cholula for colonial architecture, amazing food, and the world's largest pyramid, 2 hours away.",
      "Explore Valle de Bravo for watersports and paragliding, or visit the Monarch Butterfly Sanctuary (seasonal) in Michoacán."
    ]
  }
};

type ResponseCategory = 'restaurants' | 'workspaces' | 'neighborhoods' | 'attractions' | 'daytrips' | 'general';

const DEFAULT_RESPONSES: Record<ResponseCategory, string[]> = {
  restaurants: [
    "Let me help you discover the best local restaurants in the area.",
    "The city has a diverse food scene ranging from street food to fine dining."
  ],
  workspaces: [
    "There are several coworking spaces and cafes perfect for remote work.",
    "You'll find many spots with fast wifi and good coffee for working."
  ],
  neighborhoods: [
    "The city has diverse neighborhoods each with its own character.",
    "I can recommend areas based on your lifestyle and preferences."
  ],
  attractions: [
    "There are many cultural and historical attractions to explore.",
    "The city offers a mix of modern and traditional sights."
  ],
  daytrips: [
    "There are several interesting destinations within a few hours of the city.",
    "You can find both nature and cultural experiences nearby."
  ],
  general: [
    "Let me help you discover the best local spots in your city.",
    "There are many great coworking spaces and cafes in the area perfect for remote work.",
    "The local food scene here is vibrant and diverse.",
    "This city has excellent public transportation and is very walkable."
  ]
};

export async function handleChatMessage(req: Request, res: Response) {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    // Extract city from the message
    const cityMatch = message.match(/\[City: ([^\]]+)\]/);
    const city = cityMatch ? cityMatch[1] : "Mexico City";

    // Determine the category based on keywords in the message
    const lowerMessage = message.toLowerCase();
    let category: ResponseCategory = 'general';

    if (lowerMessage.includes('restaurant') || lowerMessage.includes('food') || lowerMessage.includes('eat')) {
      category = 'restaurants';
    } else if (lowerMessage.includes('work') || lowerMessage.includes('coworking') || lowerMessage.includes('café') || lowerMessage.includes('cafe')) {
      category = 'workspaces';
    } else if (lowerMessage.includes('neighborhood') || lowerMessage.includes('area') || lowerMessage.includes('live')) {
      category = 'neighborhoods';
    } else if (lowerMessage.includes('see') || lowerMessage.includes('visit') || lowerMessage.includes('attraction')) {
      category = 'attractions';
    } else if (lowerMessage.includes('trip') || lowerMessage.includes('weekend') || lowerMessage.includes('getaway')) {
      category = 'daytrips';
    }

    // Get city-specific responses for the category or fall back to default
    const cityResponses = MOCK_RESPONSES[city];
    const responses = cityResponses?.[category] || DEFAULT_RESPONSES[category];
    const response = responses[Math.floor(Math.random() * responses.length)];

    console.log(`Using response for ${city} - Category: ${category}`);

    // Simulate a small delay to feel more natural
    await new Promise(resolve => setTimeout(resolve, 500));

    res.json({ response });
  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({ 
      error: "Failed to get response",
      details: error.message 
    });
  }
}