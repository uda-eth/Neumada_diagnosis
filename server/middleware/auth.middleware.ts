import { Request, Response, NextFunction } from "express";
import { db } from "@db";
import { users, sessions } from "@db/schema";
import { eq } from "drizzle-orm";

/**
 * Helper function to extract the user ID from a request object in various ways
 * @param req Express request object
 * @returns User ID if found, null otherwise
 */
export function getUserIdFromRequest(req: Request): number | null {
  // Method 1: From passport session (most secure)
  if (req.isAuthenticated() && req.user && (req.user as any).id) {
    return (req.user as any).id;
  }

  // Method 2: From X-User-ID header
  const headerUserId = req.headers['x-user-id'];
  if (headerUserId && typeof headerUserId === 'string') {
    try {
      return parseInt(headerUserId);
    } catch (e) {
      console.warn("Invalid X-User-ID header format:", headerUserId);
    }
  }

  // Method 3: From session ID - doesn't attempt to look up the session
  // as that would require an async operation
  const headerSessionId = req.headers['x-session-id'] as string;
  const cookieSessionId = req.cookies?.sessionId || req.cookies?.maly_session_id;
  const sessionId = headerSessionId || cookieSessionId || req.sessionID;

  if (sessionId) {
    // Note: This would require an async function to look up the sessionId
    // We'll return null here and handle this specific case separately in endpoints
    return null;
  }

  // Method 4: From query parameter or body (least secure, use cautiously)
  if (req.query.userId) {
    try {
      return parseInt(req.query.userId as string);
    } catch (e) {
      console.warn("Invalid userId query parameter:", req.query.userId);
    }
  }

  if (req.body && req.body.userId) {
    try {
      return parseInt(req.body.userId);
    } catch (e) {
      console.warn("Invalid userId in request body:", req.body.userId);
    }
  }

  return null;
}

/**
 * Middleware to check if a user is authenticated
 * @param req Express request object 
 * @param res Express response object
 * @param next Next function to call if authenticated
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  // First check standard passport authentication
  if (req.isAuthenticated()) {
    return next();
  }

  // Then check for userId header
  if (getUserIdFromRequest(req)) {
    return next();
  }

  // Check if the request wants HTML (browser) vs API (JSON) response
  const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');
  
  // For browser requests, redirect to login page
  if (acceptsHtml) {
    console.log("Redirecting unauthenticated user to login page from isAuthenticated middleware");
    return res.redirect('/login');
  }

  // For API requests, return JSON
  return res.status(401).json({ 
    authenticated: false, 
    message: "You need to be logged in to access this resource" 
  });
}

/**
 * Helper to find a user by their session ID
 * @param sessionId The session ID to look up
 * @returns The user object if found, null otherwise
 */
export async function getUserBySessionId(sessionId: string) {
  try {
    // Find the user ID in the session
    const sessionQuery = await db.select().from(sessions).where(eq(sessions.id, sessionId));

    if (sessionQuery.length > 0 && sessionQuery[0].userId) {
      // Find the user by ID
      const userId = sessionQuery[0].userId;
      const userQuery = await db.select().from(users).where(eq(users.id, userId));

      if (userQuery.length > 0) {
        const user = userQuery[0];
        
        // Remove sensitive information
        const { password, ...userWithoutPassword } = user as any;
        return userWithoutPassword;
      }
    }
  } catch (err) {
    console.error("Error finding user by session ID:", err);
  }
  
  return null;
}

/**
 * Check authentication status and return user data
 * @param req Express request object
 * @param res Express response object
 */
export async function checkAuthentication(req: Request, res: Response) {
  // Check for session ID in headers (from the X-Session-ID header)
  const headerSessionId = req.headers['x-session-id'] as string;

  // Also check for session ID in cookies as a fallback
  const cookieSessionId = req.cookies?.sessionId || req.cookies?.maly_session_id;

  // Use header session ID first, then fall back to cookie
  const sessionId = headerSessionId || cookieSessionId;
  console.log("Session ID in auth check:", sessionId);

  // Debug session ID sources
  console.log("Auth check session sources:", {
    fromHeader: headerSessionId ? "yes" : "no",
    fromCookie: cookieSessionId ? "yes" : "no",
    finalSessionId: sessionId
  });

  // First check if user is authenticated through passport session
  if (req.isAuthenticated() && req.user) {
    console.log("Auth check: User is authenticated via passport");
    // Return authentication status with user data
    return res.json({ 
      authenticated: true,
      user: req.user
    });
  }

  // If not authenticated via passport, try with the provided session ID
  if (sessionId) {
    const user = await getUserBySessionId(sessionId);
    
    if (user) {
      console.log("Auth check: User authenticated via session ID:", user.username);
      return res.json({
        authenticated: true,
        user
      });
    }
  }

  // Check if the request wants HTML (browser) vs API (JSON) response
  const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');
  
  // Return unauthenticated status
  console.log("Auth check: User not authenticated");
  
  // For browser requests, redirect to login page
  if (acceptsHtml) {
    console.log("Redirecting unauthenticated user to login page");
    return res.redirect('/login');
  }
  
  // For API requests, return JSON
  return res.json({ 
    authenticated: false,
    message: "Not logged in"
  });
}