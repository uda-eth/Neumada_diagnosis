import OpenAI from 'openai';
import type { Request, Response } from 'express';

// City-specific mock responses
const MOCK_RESPONSES: { [key: string]: string[] } = {
  "Mexico City": [
    "Roma Norte and Condesa are the best neighborhoods for digital nomads in Mexico City, with amazing cafes like Distrito Fijo Club de Ciclismo and Blend Station.",
    "For the best tacos in Mexico City, head to El Turix in Polanco for cochinita pibil, or try the legendary Al Pastor at El Huequito.",
    "Público Café and Café Nin in Roma Norte are amazing spots to work from, with fast wifi and great coffee.",
    "Parque México in Condesa is surrounded by great coworking spaces and cafes perfect for remote work.",
    "Some of the best restaurants in Mexico City include Pujol in Polanco, Máximo Bistrot in Roma, and Contramar in Roma Norte."
  ],
  "Bali": [
    "Canggu is Bali's digital nomad hub, with popular coworking spaces like Dojo Bali and Outpost.",
    "Try traditional Balinese food at Warung Nia in Canggu, or head to La Brisa for sustainable seafood.",
    "Dojo Bali and Outpost in Canggu offer amazing coworking spaces with fast internet.",
    "For the best cafes to work from, check out Machinery Café or Milk & Madu in Canggu."
  ],
  "Bangkok": [
    "The best coworking spaces in Bangkok include The Hive in Thonglor and WeWork T-One Building.",
    "For authentic Thai food, visit Thipsamai for Pad Thai or Raan Jay Fai for crab omelettes.",
    "Try working from Hubba-To coworking space or The Commons in Thonglor.",
    "Some great cafes for working include Rocket Coffee Bar S.49 and Factory Coffee."
  ],
  "Barcelona": [
    "The Gothic Quarter and Poblenou are fantastic areas for digital nomads in Barcelona.",
    "OneCoWork in Marina Port Vell offers amazing views while you work.",
    "Try authentic Catalan cuisine at Can Culleretes or Bar del Pla.",
    "Federal Café in Sant Antoni is perfect for remote work with great coffee and food."
  ]
};

// Default responses for cities without specific recommendations
const DEFAULT_RESPONSES = [
  "Let me help you discover the best local spots in your city.",
  "There are many great coworking spaces and cafes in the area perfect for remote work.",
  "The local food scene here is vibrant and diverse.",
  "This city has excellent public transportation and is very walkable."
];

export async function handleChatMessage(req: Request, res: Response) {
  const { message, context } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    // Extract city from the context or message
    const cityMatch = message.match(/\[City: ([^\]]+)\]/);
    const city = cityMatch ? cityMatch[1] : "Mexico City"; // Default to Mexico City

    // Get city-specific responses or fall back to default
    const cityResponses = MOCK_RESPONSES[city] || DEFAULT_RESPONSES;
    const response = cityResponses[Math.floor(Math.random() * cityResponses.length)];

    console.log(`Using mock response for ${city}`);

    // Simulate a small delay to feel more natural
    await new Promise(resolve => setTimeout(resolve, 500));

    res.json({ response });
  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({ 
      error: "Failed to get response from AI",
      details: error.message 
    });
  }
}