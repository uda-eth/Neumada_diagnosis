# Maly - Social Network for Digital Nomads

A cutting-edge social networking platform designed to revolutionize professional connections through intelligent, AI-powered interactions and dynamic city exploration.

## Features

### Discover
- **City-based event discovery**: Browse events in popular digital nomad destinations
- **Filtering**: Search events by categories, vibes, and dates
- **"Be the first!" modal**: When a user selects a city with no events, they are prompted to create the first event or invite friends to join the platform
  - Automatically detects empty cities and shows a friendly invitation
  - Provides direct navigation to event creation or friend invites
  - Ensures users only see the modal once per city to avoid repetition
  
### Events
- Create and manage events
- Join and RSVP to events
- Purchase tickets for premium events
- Explore events by categories, date ranges, and mood/vibe

### Connections
- Connect with other digital nomads
- Message and chat with connections
- Follow your favorite people and businesses

### Profiles
- Showcase your interests, current location, and next destinations
- Set your mood and vibe to match with like-minded travelers
- Business profiles for spaces, promoters, and organizations

## Technology Stack

- **Frontend**: React with Wouter for routing and Tailwind CSS for styling
- **UI Components**: ShadCN UI library with Radix primitives
- **Backend**: Node.js/Express with PostgreSQL database
- **Database ORM**: Drizzle
- **Authentication**: Passport.js with session-based auth
- **Testing**: Vitest and React Testing Library

## Development

### Running the project
```bash
npm run dev
```

This starts both the Express server for the backend and a Vite server for the frontend.

### Testing
```bash
npm test
```

## Screenshots

### "Be the first!" Modal
![First Event Modal](./docs/images/first-event-modal.png)

*When a user selects a city with no events, they see this modal inviting them to be the first to create an event.*