import React, { useState } from 'react';
import { fetchLiveEvents, formatEventsForAI, getAIResponseAboutEvents } from '../lib/eventAiFetcher';

/**
 * Demo component to showcase the AI event fetching functionality
 */
export default function EventAiDemo() {
  const [events, setEvents] = useState([]);
  const [eventsText, setEventsText] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [userQuestion, setUserQuestion] = useState('');

  // Load all events
  const handleLoadEvents = async () => {
    setLoading(true);
    try {
      const eventsData = await fetchLiveEvents();
      setEvents(eventsData);
      setEventsText(formatEventsForAI(eventsData));
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter events by location
  const handleFilterByLocation = async (location) => {
    setLoading(true);
    try {
      const eventsData = await fetchLiveEvents({ location });
      setEvents(eventsData);
      setEventsText(formatEventsForAI(eventsData));
    } catch (error) {
      console.error('Error filtering events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Ask AI about events
  const handleAskAI = async () => {
    if (!userQuestion) return;
    
    setLoading(true);
    try {
      const response = await getAIResponseAboutEvents(userQuestion);
      setAiResponse(response);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setAiResponse('Sorry, I encountered an error processing your question.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">AI Event Demo</h1>
      
      <div className="flex gap-2 mb-4">
        <button 
          onClick={handleLoadEvents}
          className="px-4 py-2 bg-blue-500 text-white rounded"
          disabled={loading}
        >
          Load All Events
        </button>
        
        <button 
          onClick={() => handleFilterByLocation('Mexico City')}
          className="px-4 py-2 bg-green-500 text-white rounded"
          disabled={loading}
        >
          Filter: Mexico City
        </button>
        
        <button 
          onClick={() => handleFilterByLocation('Miami')}
          className="px-4 py-2 bg-purple-500 text-white rounded"
          disabled={loading}
        >
          Filter: Miami
        </button>
      </div>
      
      {loading && <p className="text-gray-600">Loading...</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div>
          <h2 className="text-xl font-semibold mb-2">Events Data ({events.length})</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-sm">
            {eventsText || 'No events loaded yet.'}
          </pre>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">Ask AI About Events</h2>
          <div className="mb-4">
            <input
              type="text"
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              placeholder="E.g., What events are happening this weekend?"
              className="w-full p-2 border rounded mb-2"
            />
            <button
              onClick={handleAskAI}
              className="px-4 py-2 bg-indigo-600 text-white rounded"
              disabled={loading || !userQuestion}
            >
              Ask AI
            </button>
          </div>
          
          {aiResponse && (
            <div className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
              <h3 className="font-medium mb-2">AI Response:</h3>
              <p className="whitespace-pre-wrap">{aiResponse}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Show raw event data for debugging */}
      {events.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Raw Event Data (First Event)</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-80 text-xs">
            {JSON.stringify(events[0], null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}