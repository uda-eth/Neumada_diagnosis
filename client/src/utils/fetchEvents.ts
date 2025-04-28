/**
 * Utility for fetching events from the AI events API
 */

/**
 * Fetches events from the AI events API with the given filter parameters
 * 
 * @param filters Object containing any filter parameters to apply
 * @returns Promise resolving to array of event objects
 */
export async function fetchEvents(filters: {
  category?: string;
  city?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<any[]> {
  try {
    const queryParams = new URLSearchParams();
    
    // Add each defined filter to query params
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.city) queryParams.append('city', filters.city);
    if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
    
    // Build URL with query string
    const queryString = queryParams.toString();
    const url = `/api/ai/events${queryString ? `?${queryString}` : ''}`;
    
    console.log('Fetching events from:', url);
    
    // Make the request
    const response = await fetch(url, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      console.error('Failed to fetch events:', response.status, response.statusText);
      return [];
    }
    
    const events = await response.json();
    console.log('Fetched events:', events.length);
    return events;
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}