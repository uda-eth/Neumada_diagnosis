import type { Request, Response } from 'express';
import { openai, SYSTEM_PROMPT } from './config/openai';
import { db } from '../db';
import { events, users } from '../db/schema';
import { desc, eq } from 'drizzle-orm';
import { webSearch } from './services/search';

async function searchLocalEvents(city: string) {
  try {
    const localEvents = await db.query.events.findMany({
      where: eq(events.city, city),
      orderBy: (events, { asc }) => [asc(events.date)]
    });
    return localEvents;
  } catch (error) {
    console.error('Error querying local events:', error);
    return null;
  }
}

export async function handleChatMessage(req: Request, res: Response) {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Check if message is asking about events in a specific city
    if (message.toLowerCase().includes('events')) {
      const cityMatch = message.match(/in\s+([^?.,]+)(?:[?,.]|$)/i);
      const city = cityMatch ? cityMatch[1].trim() : null;

      if (city) {
        const localEvents = await searchLocalEvents(city);
        if (localEvents && localEvents.length > 0) {
          let response = '### Local Events Found\n\n';
          localEvents.forEach(event => {
            response += `- **${event.title}**\n`;
            response += `  - Date: ${new Date(event.date).toLocaleDateString()}\n`;
            response += `  - Location: ${event.location}\n`;
            response += `  - Category: ${event.category}\n`;
            response += `  - Price: ${event.price}\n\n`;
          });
          return res.json({ response });
        }
      }
    }

    // Default handling with web search capability
    const needsWebSearch = message.toLowerCase().includes('event') || 
                          message.toLowerCase().includes('happening') ||
                          message.toLowerCase().includes('what\'s on') ||
                          message.toLowerCase().includes('whats on') ||
                          message.toLowerCase().includes('restaurant') ||
                          message.toLowerCase().includes('food') ||
                          message.toLowerCase().includes('eat') ||
                          message.toLowerCase().includes('dining') ||
                          message.toLowerCase().includes('cafe') ||
                          message.toLowerCase().includes('bar');

    let model = "gpt-4-turbo-preview";
    let searchContext = "";

    // Perform web search if needed
    if (needsWebSearch) {
      const searchResults = await webSearch(message);
      searchContext = searchResults.map((result, index) => {
        const cleanTitle = result.title.replace(/\*\*/g, '').replace(/\[|\]/g, '');
        const cleanSnippet = result.snippet.replace(/\*\*/g, '').replace(/\[|\]/g, '');
        return `${index + 1}. ${cleanTitle}: ${cleanSnippet}`;
      }).join('\n');
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
      messages: [
        { 
          role: "system", 
          content: `${SYSTEM_PROMPT}

          Important instructions:
          1. Always respond in English
          2. Keep responses brief and direct
          3. For recommendations (restaurants, cafes, workspaces, bars, etc):
             Format strictly as:
             1. Place name: One concise description
             2. Place name: One concise description
             3. Place name: One concise description
             4. Place name: One concise description
             5. Place name: One concise description
          4. For events:
             • List name, date, and location clearly
             • One key detail about the event
          5. Do not add introductory or closing text for recommendations
          5. Use simple bullet points and clean spacing
          6. Avoid markdown formatting or special characters

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