# Authentication Redirect Implementation Notes

## Summary of Changes

The authentication system now properly redirects unauthenticated users to the login page for browser requests while maintaining JSON responses for API requests. The client-side code has also been fixed to handle authentication properly, and authenticated users can now navigate the application without being redirected back to the login page.

### Files Modified:
- `server/middleware/auth.middleware.ts`:
  - Updated the `isAuthenticated` middleware to check Accept headers
  - Updated `checkAuthentication` function to redirect for browser requests
- `server/routes.ts`:
  - Enhanced `/api/user-by-session` endpoint to redirect for browser requests
  - Added content negotiation to all authentication-related error cases
  - Improved session ID detection to check multiple sources (headers, cookies, Express session)
  - Added support for Passport-authenticated users in the `/api/user-by-session` endpoint
- `client/src/pages/AuthPage.tsx`:
  - Fixed undefined `checkAndRedirect` function reference 
  - Simplified authentication flow on the login page

### Implementation Details:
- We implement content negotiation by checking the request's `Accept` header
- Requests with `Accept: text/html` are considered browser requests and get redirected
- Requests with `Accept: application/json` still receive JSON responses
- All error cases (no session, invalid session, server error) now redirect for browser requests
- Client-side code no longer tries to use undefined functions
- `/api/user-by-session` now checks multiple sources for session IDs:
  - X-Session-ID header
  - Cookie sessionId and maly_session_id
  - Express session ID (req.sessionID)
  - Passport authentication (req.isAuthenticated())

### Validation:
- Tested with a custom script (`test-auth-redirect.js`) to verify the behavior
- Browser requests are properly redirected to `/login`
- API clients still receive standard JSON responses
- The app can be used by both types of clients without breaking compatibility
- The black screen error for unauthenticated users is fixed
- Authenticated users are no longer redirected back to the login page

### Known Issues:
- There may be an issue with Vite's host configuration in the Replit environment
- The Vite server is showing a 403 Forbidden error for some requests
- This is unrelated to our authentication changes and should be addressed separately

### Future Considerations:
- Other endpoints that require authentication might benefit from similar redirect logic
- Consider implementing this pattern more broadly for a consistent user experience
- Address the Vite configuration issue to improve the overall developer experience