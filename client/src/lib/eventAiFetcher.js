/**
 * Utility functions for AI agents to fetch events data from the API
 */

/**
 * Fetches events from the AI events API with optional filters
 * @param {Object} filters - Object containing filters to apply
 * @param {number} [filters.id] - Filter by specific event ID
 * @param {string} [filters.location] - Filter by location/city
 * @param {string} [filters.date] - Filter by date (events on or after this date)
 * @returns {Promise<Array>} - Array of event objects
 */
export async function fetchLiveEvents(filters = {}) {
  try {
    // Convert filters to query string
    const queryParams = new URLSearchParams();
    
    // Add each filter parameter if it exists
    if (filters.id) queryParams.append('id', filters.id);
    if (filters.location) queryParams.append('location', filters.location);
    if (filters.date) queryParams.append('date', filters.date);
    
    const qs = queryParams.toString();
    
    // Use relative URL to work in any environment
    const res = await fetch(`/api/ai/events${qs ? `?${qs}` : ''}`, {
      headers: { "Content-Type": "application/json" }
    });
    
    if (!res.ok) {
      console.error("Error fetching events:", res.status, res.statusText);
      return [];
    }
    
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch events:", err);
    return [];
  }
}

/**
 * Formats events into a readable string for AI context
 * @param {Array} events - Array of event objects 
 * @returns {string} - Formatted events string for AI context
 */
export function formatEventsForAI(events) {
  if (!events || events.length === 0) {
    return "No events found.";
  }
  
  return "Current events:\n" +
    events.map(e => {
      const date = new Date(e.date).toLocaleString(undefined, {
        weekday: 'short',
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
      
      return `• [${e.id}] ${e.title} — ${date} @ ${e.location} (${e.category}, ${e.price === '0' ? 'Free' : '$'+e.price})`;
    }).join("\n");
}

/**
 * Finds events that match a specific date range (e.g., "this weekend")
 * @param {string} timeFrame - Time frame to search for ("today", "this weekend", "this week", "next week")
 * @returns {Promise<Array>} - Filtered array of events
 */
export async function findEventsByTimeFrame(timeFrame) {
  // Get all events first
  const events = await fetchLiveEvents();
  
  // Get current date and set to midnight
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  // Calculate date ranges based on timeFrame
  let startDate, endDate;
  
  switch(timeFrame.toLowerCase()) {
    case 'today':
      startDate = now;
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
      break;
      
    case 'this weekend':
      // Find the next Saturday and Sunday
      startDate = new Date(now);
      const dayToSaturday = (6 - now.getDay()) % 7; // Days until Saturday (0 = Sunday, 6 = Saturday)
      startDate.setDate(now.getDate() + dayToSaturday);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 1); // Sunday
      endDate.setHours(23, 59, 59, 999);
      break;
      
    case 'this week':
      startDate = now;
      endDate = new Date(now);
      // Set to end of coming Sunday
      const daysToSunday = (7 - now.getDay()) % 7;
      endDate.setDate(now.getDate() + daysToSunday);
      endDate.setHours(23, 59, 59, 999);
      break;
      
    case 'next week':
      // Start from next Monday
      startDate = new Date(now);
      const daysToMonday = (8 - now.getDay()) % 7;
      startDate.setDate(now.getDate() + daysToMonday);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); // To the following Sunday
      endDate.setHours(23, 59, 59, 999);
      break;
      
    default:
      // Default to next 7 days if timeframe isn't recognized
      startDate = now;
      endDate = new Date(now);
      endDate.setDate(now.getDate() + 7);
      break;
  }
  
  // Filter events by date range
  return events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= startDate && eventDate <= endDate;
  });
}

/**
 * Example function showing how to use events in an AI context
 * @param {string} question - User question about events 
 * @returns {Promise<string>} - AI response to the user question
 */
export async function getAIResponseAboutEvents(question) {
  try {
    // Fetch all events to have in context
    const events = await fetchLiveEvents();
    
    // Format events for AI context
    const eventsContext = formatEventsForAI(events);
    
    // This is where you would send the question and events context to your AI service
    // For demonstration purposes, we're simulating a response
    
    // Simple keyword-based response for demo purposes
    // In a real implementation, this would be replaced with an actual AI call
    if (question.toLowerCase().includes('weekend')) {
      const weekendEvents = await findEventsByTimeFrame('this weekend');
      return `Here are events happening this weekend:\n\n${formatEventsForAI(weekendEvents)}`;
    }
    
    if (question.toLowerCase().includes('today')) {
      const todayEvents = await findEventsByTimeFrame('today');
      return `Here are events happening today:\n\n${formatEventsForAI(todayEvents)}`;
    }
    
    // Generic response with all events
    return `Here are all upcoming events:\n\n${eventsContext}`;
  } catch (err) {
    console.error("Error generating AI response:", err);
    return "Sorry, I couldn't load event information at the moment.";
  }
}