🔧 Connect Page & Mood Update Bugfixes

1. Remove Duplicate Filter Icon
Issue: Two filter icons appear in the header.

Action Steps:
- Locate the filter icon component import in ConnectPage.tsx (or its layout wrapper).
- Identify the two instances of <FilterIcon /> (or similar) and remove the extra one.
- Verify only a single filter button remains, styled consistently with Discover.

2. Center & Space Connect Cards
Issue: User cards are stuck to the left edge, not centered or evenly spaced.

Action Steps:
- In the CSS/JSX container for the grid (e.g. .connect-grid), ensure you're using a responsive grid system:
```css
display: grid;
grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
gap: 1rem;
justify-items: center;      /* centers each card */
```
- Remove any justify-content: flex-start or margin-left: 0 overrides.
- Confirm that the parent container has proper padding/margin to avoid sticking to the viewport edge.

3. Fix Filtering Logic (Connect Page)
Issue: All 18 users always return; location & mood filters have no effect.

Action Steps:
- In the filter change handler, inspect the query parameters being sent to /api/users/browse.
- Should be: ?city=SelectedCity&moods[]=Mood1&moods[]=Mood2
- Update the React state hook to accumulate multi-select moods:
```tsx
const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
// onClick mood badge:
setSelectedMoods(prev => prev.includes(mood) ? prev.filter(m=>m!==mood) : [...prev, mood]);
```
- Ensure the API call uses these values:
```tsx
fetch(`/api/users/browse?city=${city}&${selectedMoods.map(m=>`moods[]=${m}`).join('&')}`)
```
- On the server (/api/users/browse), confirm you apply:
```tsx
if (moods) {
  query = query.where(users.currentMoods.overlaps(moodsArray))
}
```
- Write unit tests (or manual logs) to confirm filter queries yield subsets, not the full list.

4. Resolve Mood-Update JSON Error
Issue: "Error updating mood: Unexpected token <!doctype is not valid JSON"

Likely Cause: The client POST to /api/profile is receiving an HTML error page rather than JSON.

Action Steps:
- In the front end, the mood PATCH request should:
```tsx
fetch('/api/profile', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ currentMoods: [newMood] })
})
```
- Confirm the server endpoint app.post('/api/profile') is sending back res.json(updatedUser) and not redirecting or rendering HTML.
- Check for any middleware that might intercept and return an HTML login page on 401 — ensure API routes return JSON with status codes.
- Add error handling in the client:
```tsx
if (!res.ok) {
  const err = await res.text();
  throw new Error(`Error updating mood: ${err}`);
}
```
- Test updating mood in isolation (using Postman or browser console) to verify JSON round-trip.

✅ Acceptance Criteria
- [x] Only one filter icon appears on Connect page.
- [x] Connect cards are centered and evenly spaced on all screen sizes.
- [x] Location and Mood filters narrow down results correctly.
- [x] Editing profile mood sends/receives valid JSON; no HTML parsing errors.
- [x] All fixes are committed alongside this spec file for future reference.
# Connect Page Bugfixes

## Issues to Fix

- Remove broken, duplicated mood-filter logic
- Restore proper server-side filtering
- Fix parameter building in the useQuery call

## Steps to Implement

### Consolidate Filtering Logic

- Remove any client-side mood filtering beyond the server query
- In filteredUsers, only search by name; delete any code that tries to filter by selectedMoods
- Ensure the only mood filter lives in the useQuery call—by appending moods[] params
- Ensure React Query re-runs when selectedMoods changes

### Fix the Query Parameter Building

- In the queryFn for useQuery, confirm loop over selectedMoods with: `selectedMoods.forEach(mood => params.append('moods[]', mood));`
- Make sure queryKey includes selectedMoods so React Query automatically triggers a refetch when they change
- Remove any stray code paths that also hit `/api/users/browse` elsewhere in this file with a different param name

### Simplify toggleFilter & State Updates

- Ensure toggleFilter(item, 'moods') only affects selectedMoods state
- Verify that React Query's cache invalidates so a fresh API request uses the new moods[] list

### Verify Backend Endpoint Compatibility

- Confirm `/api/users/browse` on the server parses req.query['moods[]'] (an array of strings) and filters users whose currentMoods overlap
- If the server code expects moods instead of moods[], either update the front-end to match or rename params in the API handler

### Enhance User Feedback

- When no users match the current filters, show "No users found matching your criteria."
- Display a count of active mood filters near the "Filters" button

### Remove Duplicate Filter UI

- Remove any legacy "Filters" button or icon so only one remains

## Test Flows

- Select one or more moods → API call includes moods[]=… for each → only users with at least one matching mood appear
- Clear all moods → a fresh fetch returns all users in the selected city
- Toggling moods doesn't leave any ghost filters or stale UI state
