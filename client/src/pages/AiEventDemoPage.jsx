import React from 'react';
import EventAiDemo from '../components/EventAiDemo';

export default function AiEventDemoPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">AI Event Assistant Demo</h1>
        <p className="text-gray-600 mb-8">
          This demo shows how AI can access live events data from the platform's database
          and provide accurate, up-to-date information to users.
        </p>
        
        <EventAiDemo />
        
        <div className="mt-12 border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">How This Works</h2>
          <ol className="list-decimal pl-6 space-y-3">
            <li>
              <strong>Secure API Endpoint</strong>: Our backend exposes the <code>/api/ai/events</code> endpoint 
              that provides direct access to the events database.
            </li>
            <li>
              <strong>Live Data Access</strong>: When queried, the AI receives up-to-date information about 
              all events in the system.
            </li>
            <li>
              <strong>Intelligent Filtering</strong>: The API supports filtering by ID, location, 
              and date for targeted queries.
            </li>
            <li>
              <strong>AI Context Integration</strong>: Event data is formatted and added to the AI's 
              context window so it can provide accurate responses.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}