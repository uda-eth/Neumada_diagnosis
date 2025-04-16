Feature Specification: Prioritize Mood Selection & Enhance Connect Page

1. Make "Moods" the Primary CTA on Edit Profile Page
Move the moods selector into the top, above bio/introduction.

Style it as the first, most prominent section:

Use a larger heading: "How are you feeling today?"

Render mood buttons/cards in a full-width, responsive row.

Highlight the selected mood with a distinct border or background color.

Ensure the selection is saved immediately when clicked (use onChange → PATCH /api/profile).

After save, display a toast: "Your mood has been updated!"

2. Revamp the Connect Page Layout
a. Match Discover Grid
Display user cards in a 4×4 grid on desktop, 2×2 on tablet, 1×1 on mobile.

Use the same CSS classes/components as Discover (e.g. <EventCard> grid wrapper).

Ensure consistent gutters, card aspect ratios, and hover states.

b. Reorder & Strengthen Filters
Location Filter

Position at the top-left of the filter bar.

Use a dropdown or pill‑style buttons: "All Cities", "New York", etc.

Mood Filter

Position immediately to the right of Location.

Render mood options as clickable icons (emoji or colored badges).

Only show users whose currentMood matches the selected mood(s).

Filter Behavior

Multi‑select allowed for moods.

On change, call GET /api/users/browse?city=…&moods[]=….

Display a loading spinner in the grid until results return.

If no results, show "No users match this mood in your city."

3. Mood as Primary Action on User Profiles
Profile Header

Under the user's name/photo, show their currentMood as a pill with icon.

Label it "Current Mood: 😊" (or whichever mood).

CTA Buttons

Below the mood pill, display two buttons:

"Change Your Mood" (for your own profile) or "Share Your Mood" (for others)

"Send Connection" / "Message"

Interactivity

Clicking "Change Your Mood" opens the same mood selector overlay.

For visiting another user's profile, "Share Your Mood" encourages them to set theirs and compare.

Acceptance Criteria

 Edit Profile page header reorders to mood first and saves instantly

 Connect page grid matches Discover's responsive layout

 Location dropdown and mood filter appear in correct order and function together

 User Profile pages prominently display mood and mood‑action button

Please work through each item methodically, commit changes referencing this spec file, and verify visual consistency across devices before marking as complete.