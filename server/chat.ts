import type { Request, Response } from 'express';
import { openai, SYSTEM_PROMPT, WEB_SEARCH_MODEL } from './config/openai';
import { db } from '../db';
import { events, users } from '../db/schema';
import { desc, sql } from 'drizzle-orm';
import { webSearch } from './services/search';

export async function handleChatMessage(req: Request, res: Response) {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Get latest events and format them for context
    const latestEvents = await db.query.events.findMany({
      orderBy: [desc(events.date)],
      limit: 10,
    });

    const eventsContext = latestEvents.map(event => `
      Event: ${event.title}
      Date: ${event.date}
      Location: ${event.location}
      Price: ${event.price}
      Category: ${event.category}
      Description: ${event.description}
    `).join('\n');

    // Get active users
    const activeUsers = await db.query.users.findMany({
      orderBy: [desc(users.lastActive)],
      limit: 5,
    });

    const usersContext = activeUsers.map(user => `
      Name: ${user.fullName}
      Location: ${user.location}
      Interests: ${user.interests?.join(', ')}
    `).join('\n');

    // Get relevant web search results
    const searchResults = await webSearch(message);
    const searchContext = searchResults.map(result => 
      `${result.title}\n${result.snippet}`
    ).join('\n\n');

    const completion = await openai.chat.completions.create({
      model: WEB_SEARCH_MODEL,
      web_search_options: {
        search_context_size: "medium",
      },
      messages: [
        { 
          role: "system", 
          content: `${SYSTEM_PROMPT}\n\nCurrent Events:\n${eventsContext}\n\nActive Community Members:\n${usersContext}` 
        },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const response = completion.choices[0].message.content;
    res.json({ response });

  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({ 
      error: "Failed to get response",
      details: error.message 
    });
  }
}