import OpenAI from 'openai';
import type { Request, Response } from 'express';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    res.json({ response: completion.choices[0].message.content });
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    res.status(500).json({ 
      error: "Failed to get response from AI",
      details: error.message 
    });
  }
}