# "Be the first!" Modal for Empty Cities

## Overview

The "Be the first!" modal is designed to encourage users to create events in cities where none currently exist. This feature helps bootstrap the platform's content in new locations by prompting early adopters to contribute.

## When it appears

The modal appears when:
1. A user selects a specific city (not "All Locations") from the dropdown in the Discover page
2. No events exist for that city in the database
3. The user hasn't previously dismissed the modal for this specific city

## How to trigger it 

To test or demonstrate this feature:
1. Go to the Discover page
2. Select a city from the dropdown that has no events
3. The modal will automatically appear

## User actions

When the modal appears, users have three options:
1. **Create Event**: Redirects to the event creation page
2. **Invite Friends**: Redirects to the invite page to bring friends to the platform
3. **Maybe Later**: Dismisses the modal without taking action

## Session behavior

The modal is designed to appear only once per city per session. When a user dismisses the modal for a specific city, it won't appear again for that city until they clear their session data.

## Implementation details

The modal is implemented as a standalone React component (`FirstEventModal.tsx`) that receives three props:
- `cityName`: The name of the city with no events
- `open`: Boolean controlling the modal's visibility
- `onClose`: Callback function to handle modal dismissal

The logic for detecting empty cities and managing modal visibility is handled in the `DiscoverPage` component.