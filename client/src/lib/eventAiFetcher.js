/**
 * Utility for AI agents to fetch and process events data
 */

/**
 * Fetches live events from the API
 * @param {Object} options - Filter options for events
 * @returns {Promise<Array>} Array of event objects
 */
export async function fetchLiveEvents(options = {}) {
  try {
    // Build query params
    const queryParams = new URLSearchParams();
    
    if (options?.location || options?.city) {
      queryParams.append('city', options?.location || options?.city);
    }
    if (options?.category) queryParams.append('category', options.category);
    if (options?.dateFrom) queryParams.append('dateFrom', options.dateFrom);
    if (options?.dateTo) queryParams.append('dateTo', options.dateTo);
    
    // Make the API request
    const response = await fetch(`/api/ai/events?${queryParams.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      console.error('Failed to fetch events:', response.status);
      return [];
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching live events:', error);
    return [];
  }
}

/**
 * Formats events data for AI processing
 * @param {Array} events - Array of event objects
 * @returns {string} Formatted events text
 */
export function formatEventsForAI(events) {
  if (!events || events.length === 0) {
    return "No events available.";
  }
  
  return events.map((event, index) => `
Event #${index + 1}:
- Title: ${event.title}
- Date: ${event.humanReadableDate || new Date(event.date).toLocaleDateString()}
- Location: ${event.location}
- Category: ${event.category || 'Uncategorized'}
- Price: ${event.price === '0' ? 'Free' : '$' + event.price}
- Description: ${event.description ? event.description.slice(0, 150) + (event.description.length > 150 ? '...' : '') : 'No description available.'}
`).join('\n');
}

/**
 * Gets AI response about events based on a user question
 * @param {string} question - The user's question about events
 * @returns {Promise<string>} AI's response
 */
export async function getAIResponseAboutEvents(question) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: question,
        context: 'The user is asking about events: ' + question
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }
    
    const data = await response.json();
    return data.response || 'Sorry, I could not process your question about events.';
  } catch (error) {
    console.error('Error getting AI response:', error);
    return 'Sorry, I encountered an error while processing your question.';
  }
}

/**
 * Function to fetch events from the AI events API with formatting
 * @param {Object} options - Filter options for events
 * @param {string} options.city - City name to filter events by
 * @param {string} options.category - Event category to filter by
 * @param {string} options.dateFrom - Start date for event range (ISO date string)
 * @param {string} options.dateTo - End date for event range (ISO date string)
 * @returns {Promise<Array>} Formatted event data
 */
export async function getEventsForAI(options = {}) {
  try {
    // Build query params
    const queryParams = new URLSearchParams();
    
    if (options.city) queryParams.append('city', options.city);
    if (options.category) queryParams.append('category', options.category);
    if (options.dateFrom) queryParams.append('dateFrom', options.dateFrom);
    if (options.dateTo) queryParams.append('dateTo', options.dateTo);
    
    // Make the API request
    const response = await fetch(`/api/ai/events?${queryParams.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      console.error('Failed to fetch events from AI API:', response.status);
      return [];
    }
    
    const events = await response.json();
    
    // Format events for AI consumption
    return events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      location: event.location,
      date: event.date,
      humanReadableDate: event.humanReadableDate,
      category: event.category,
      price: event.price?.toString() || 'Free',
      image: event.image,
      capacity: event.capacity,
      host: event.hostId ? {
        id: event.hostId,
        // Host details would need to be populated separately if needed
      } : null,
      tags: event.tags?.split(',') || []
    }));
  } catch (error) {
    console.error('Error fetching events data for AI:', error);
    return [];
  }
}

/**
 * Function to format event data for presentation in AI assistant responses
 * @param {Array} events - Events to format for presentation
 * @returns {string} Formatted event text
 */
export function formatEventsForAIResponse(events) {
  if (!events || events.length === 0) {
    return "I couldn't find any events matching your criteria.";
  }
  
  return `Here are some events that match your query:\n\n${events.map((event, index) => `
${index + 1}. **${event.title}**
   📅 ${event.humanReadableDate || new Date(event.date).toLocaleDateString()}
   📍 ${event.location}
   💰 ${event.price === '0' ? 'Free' : '$' + event.price}
   🏷️ ${event.category}
   ${event.description ? `ℹ️ ${event.description.slice(0, 100)}${event.description.length > 100 ? '...' : ''}` : ''}
  `).join('\n')}`;
}

/**
 * Detects relevant categories from user input
 * @param {string} userInput - The user's query text
 * @returns {string|null} Detected category or null if no match
 */
export function detectEventCategory(userInput) {
  const normalizedInput = userInput.toLowerCase();
  
  const categoryMatchers = {
    'music': ['music', 'concert', 'band', 'festival', 'dj', 'live music'],
    'art': ['art', 'exhibition', 'gallery', 'museum', 'sculpture'],
    'food': ['food', 'restaurant', 'dining', 'culinary', 'cuisine', 'eatery'],
    'tech': ['tech', 'technology', 'coding', 'development', 'programming', 'software'],
    'social': ['social', 'networking', 'meetup', 'mixer'],
    'workshop': ['workshop', 'class', 'learn', 'education', 'course']
  };
  
  for (const [category, keywords] of Object.entries(categoryMatchers)) {
    if (keywords.some(keyword => normalizedInput.includes(keyword))) {
      return category.charAt(0).toUpperCase() + category.slice(1); // Capitalize first letter
    }
  }
  
  return null;
}