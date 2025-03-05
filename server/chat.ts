
import OpenAI from 'openai';
import type { Request, Response } from 'express';

// Mock responses for travel companion
const MOCK_RESPONSES = [
  "Welcome to your digital nomad journey! I'm here to help with local recommendations and travel tips.",
  "Mexico City has great coworking spaces in Roma Norte and Condesa neighborhoods. Have you checked out Selina or WeWork there?",
  "When in Bali, don't miss the rice terraces in Ubud and beach clubs in Canggu - they're digital nomad hotspots!",
  "Tokyo offers amazing food experiences! For remote work, check out the coworking spaces in Shibuya and Roppongi.",
  "Chiang Mai in Thailand is known for its affordability and vibrant digital nomad community.",
  "Portugal's Lisbon and Porto are becoming digital nomad hubs thanks to their quality of life and good internet.",
  "For a great work-life balance, consider Medellín, Colombia - it has perfect weather year-round!"
];

export async function handleChatMessage(req: Request, res: Response) {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    // Instead of calling OpenAI API, return a random mock response
    const mockResponse = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
    
    console.log("Using mock response instead of OpenAI API");
    
    // Simulate a small delay to feel more natural
    await new Promise(resolve => setTimeout(resolve, 500));
    
    res.json({ response: mockResponse });
  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({ 
      error: "Failed to get response from AI",
      details: error.message 
    });
  }
}
