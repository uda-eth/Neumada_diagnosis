/**
 * Utility functions for parsing user queries for event filtering
 */

/**
 * Extracts event filter parameters from natural language user text
 * 
 * @param text The user's message or query text
 * @returns Object with category and city parameters if found
 */
export function parseFiltersFromText(text: string): { category?: string; city?: string; dateFrom?: string; dateTo?: string } {
  // Normalize the text for case-insensitive matching
  const normalizedText = text.toLowerCase();
  const filters: { category?: string; city?: string; dateFrom?: string; dateTo?: string } = {};
  
  // Match category
  const categoryMatches = [
    { pattern: /art|exhibit|gallery|museum/i, category: 'Art' },
    { pattern: /music|concert|dj|band|festival/i, category: 'Music' },
    { pattern: /food|restaurant|dining|culinary|eat/i, category: 'Food' },
    { pattern: /tech|technology|coding|developer|software/i, category: 'Tech' },
    { pattern: /social|meetup|networking|mixer/i, category: 'Social' },
    { pattern: /workshop|class|learn|course/i, category: 'Workshop' },
  ];
  
  for (const match of categoryMatches) {
    if (match.pattern.test(normalizedText)) {
      filters.category = match.category;
      break;
    }
  }
  
  // Extract city name
  // Look for common patterns like "in [City]" or "at [City]"
  const cityMatch = text.match(/(?:in|at|from|near)\s+([^?.,]+)(?:[?,.]|$)/i);
  if (cityMatch && cityMatch[1]) {
    // Use the capture group which contains just the city name
    filters.city = cityMatch[1].trim();
  }
  
  // Detect date ranges
  const now = new Date();
  const dateFormatter = (date: Date) => date.toISOString().split('T')[0];
  
  if (/today|tonight/i.test(normalizedText)) {
    // Today
    filters.dateFrom = dateFormatter(now);
    filters.dateTo = dateFormatter(now);
  } else if (/tomorrow/i.test(normalizedText)) {
    // Tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    filters.dateFrom = dateFormatter(tomorrow);
    filters.dateTo = dateFormatter(tomorrow);
  } else if (/this\s+weekend/i.test(normalizedText)) {
    // This weekend (next Saturday and Sunday)
    const saturday = new Date(now);
    saturday.setDate(now.getDate() + ((6 - now.getDay()) % 7 || 7));
    
    const sunday = new Date(saturday);
    sunday.setDate(saturday.getDate() + 1);
    
    filters.dateFrom = dateFormatter(saturday);
    filters.dateTo = dateFormatter(sunday);
  } else if (/next\s+week/i.test(normalizedText)) {
    // Next week (Monday through Sunday)
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + ((8 - now.getDay()) % 7));
    
    const nextSunday = new Date(nextMonday);
    nextSunday.setDate(nextMonday.getDate() + 6);
    
    filters.dateFrom = dateFormatter(nextMonday);
    filters.dateTo = dateFormatter(nextSunday);
  }
  
  return filters;
}

/**
 * Helper function to check if a query is about events
 */
export function isEventQuery(text: string): boolean {
  const eventKeywords = [
    'event', 'events', 'happening', 'going on', 'things to do',
    'concert', 'show', 'exhibition', 'performance', 'festival'
  ];
  
  const normalizedText = text.toLowerCase();
  
  // Check if any event keyword is in the text
  return eventKeywords.some(keyword => normalizedText.includes(keyword));
}