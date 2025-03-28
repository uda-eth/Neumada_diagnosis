import type { Request, Response } from 'express';
import { openai, SYSTEM_PROMPT } from './config/openai';
import { db } from '../db';
import { events, users } from '../db/schema';
import { desc, eq } from 'drizzle-orm';
import { webSearch } from './services/search';

async function searchLocalEvents(city?: string) {
  try {
    const baseQuery = {
      orderBy: [desc(events.date)],
      limit: 10,
      with: {
        creator: true
      }
    };

    const query = city ? {
      ...baseQuery,
      where: eq(events.city, city)
    } : baseQuery;

    const results = await db.query.events.findMany(query);
    console.log('[SQL Results]', results.length, 'events found');

    // Filter events by city after query
    return results.filter(event => 
      city ? event.city.toLowerCase() === city.toLowerCase() : true
    );
    return results;
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

    // Check if message is asking about events
    if (message.toLowerCase().includes('events') || 
        message.toLowerCase().includes('going on') || 
        message.toLowerCase().includes('happening')) {

      const cityMatch = message.match(/in\s+([^?.,]+)(?:[?,.]|$)/i);
      const city = cityMatch ? cityMatch[1].trim() : undefined;

      const localEvents = await searchLocalEvents(city);

      if (localEvents && localEvents.length > 0) {
        let response = '### Local Events (Mexico City)\n\n';
        localEvents
          .filter(event => event.location === "Mexico City")
          .forEach((event, index) => {
            response += `${index + 1}. **${event.title}**\n`;
            response += `   - Date: ${new Date(event.date).toLocaleDateString()}\n`;
            response += `   - Location: ${event.location}\n`;
            response += `   - Category: ${event.category}\n`;
            response += `   - Price: ${event.price || 'Free'}\n`;
            response += `   - Creator: ${event.creatorName}\n`;
            if (event.description) {
              response += `   - Description: ${event.description}\n`;
            }
            response += '\n';
          });
        response += '\nThese events are sourced from local user-posted data in our database.';
        return res.json({ response });
      } else {
        let response = '### Debugging Information\n\n';
        response += 'No local events were found. Please verify the following:\n\n';
        response += '* Database Seeding: Run `npm run seed` to populate test data\n';
        response += '* Database Connection: Check database connection status in logs\n';
        response += '* Data Verification:\n';
        response += '  - Confirm events exist with location="Mexico City"\n';
        response += '  - Verify creator_id fields are properly populated\n';
        response += '* Query Filters:\n';
        response += '  - Check case sensitivity of "Mexico City" matching\n';
        response += '  - Verify location field name in schema matches query\n';
        response += '\nIf issues persist, check server logs for potential error messages.';
        return res.json({ response });
      }
    }

    // Default handling
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
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