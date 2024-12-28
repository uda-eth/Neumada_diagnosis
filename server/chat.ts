import Anthropic from '@anthropic-ai/sdk';
import type { Request, Response } from 'express';

// the newest Anthropic model is "claude-3-5-sonnet-20241022" which was released October 22, 2024
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an AI travel companion helping digital nomads and travelers. 
Your expertise includes:
- Providing personalized travel recommendations
- Suggesting local experiences and hidden gems
- Offering cultural insights and etiquette tips
- Helping with travel planning and logistics
- Addressing common travel concerns and safety tips

Always be friendly, concise, and practical in your responses. 
If you're unsure about specific real-time information (like current events or exact prices), 
make that clear in your response.`;

export async function handleChatMessage(req: Request, res: Response) {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{
        role: "user",
        content: message
      }],
    });

    res.json({ response: response.content[0].text });
  } catch (error: any) {
    console.error("Anthropic API error:", error);
    res.status(500).json({ 
      error: "Failed to get response from AI",
      details: error.message 
    });
  }
}
