
import type { Request, Response } from 'express';
import { openai, SYSTEM_PROMPT } from './config/openai';
import { db } from '../db';
import { events, users } from '../db/schema';
import { desc } from 'drizzle-orm';
import { webSearch } from './services/search';

export async function handleChatMessage(req: Request, res: Response) {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Determine if we need web search based on message content
    const needsWebSearch = message.toLowerCase().includes('event') || 
                          message.toLowerCase().includes('happening') ||
                          message.toLowerCase().includes('what\'s on') ||
                          message.toLowerCase().includes('whats on');

    let model = "gpt-4";
    let webSearchOptions = undefined;
    let searchContext = "";

    if (needsWebSearch) {
      model = "gpt-4o-search-preview";
      webSearchOptions = { search_context_size: "medium" };
      
      // Get relevant web search results
      const searchResults = await webSearch(message);
      searchContext = searchResults.map(result => 
        `${result.title}\n${result.snippet}`
      ).join('\n\n');
    }

    // Get latest events and format them
    const latestEvents = await db.query.events.findMany({
      orderBy: [desc(events.date)],
      limit: 10,
    });

    const eventsContext = latestEvents.map(event => 
      `Event: ${event.title}
      Date: ${new Date(event.date).toLocaleDateString()}
      Location: ${event.location}
      Price: ${event.price}
      Category: ${event.category}`
    ).join('\n\n');

    // Get active users
    const activeUsers = await db.query.users.findMany({
      orderBy: [desc(users.lastActive)],
      limit: 5,
    });

    const usersContext = activeUsers.map(user => 
      `Name: ${user.fullName}
      Location: ${user.location}
      Interests: ${user.interests?.join(', ')}`
    ).join('\n\n');

    const completion = await openai.chat.completions.create({
      model,
      ...(webSearchOptions && { web_search_options: webSearchOptions }),
      messages: [
        { 
          role: "system", 
          content: `${SYSTEM_PROMPT}
          
          Important instructions:
          1. Always respond in English
          2. Keep responses brief and direct
          3. Limit responses to 2-3 key points or events
          4. Format event listings as:
             • [Event Name] - [Date] at [Location]
             Brief one-line description if needed.
          5. Avoid using bold text or complex formatting
          6. Use simple bullet points for readability
          
          Context:
          Current Events:\n${eventsContext}
          
          Active Community Members:\n${usersContext}
          ${searchContext ? `\nWeb Search Results:\n${searchContext}` : ''}`
        },
        { role: "user", content: message }
      ],
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
