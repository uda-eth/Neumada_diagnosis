import passport from "passport";
import { IVerifyOptions, Strategy as LocalStrategy } from "passport-local";
import { type Express } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import { createHash } from "crypto";
import { users } from "@db/schema";
import { db } from "@db";
import { eq } from "drizzle-orm";

// Define the User type to match our schema
type UserType = {
  id: number;
  username: string;
  email: string;
  password: string;
  fullName: string | null;
  bio: string | null;
  profileImage: string | null;
  location: string | null;
  interests: string[] | null;
  currentMoods?: string[] | null;
  profession?: string | null;
  age?: number | null;
  gender?: string | null;
  nextLocation?: string | null;
  createdAt: Date | null;
};

declare global {
  namespace Express {
    // Define the User interface without circular reference
    interface User {
      id: number;
      username: string;
      email: string;
      password: string;
      fullName: string | null;
      bio: string | null;
      profileImage: string | null;
      location: string | null;
      interests: string[] | null;
      currentMoods?: string[] | null;
      profession?: string | null;
      age?: number | null;
      gender?: string | null;
      nextLocation?: string | null;
      createdAt: Date | null;
    }
  }
}

const crypto = {
  hash: async (password: string): Promise<string> => {
    console.log("Hashing new password");
    const hashedPassword = createHash('sha256').update(password).digest('hex');
    console.log("Generated hash length:", hashedPassword.length);
    return hashedPassword;
  },
  compare: async (suppliedPassword: string, storedPassword: string): Promise<boolean> => {
    console.log("Comparing passwords");
    console.log("Stored password hash length:", storedPassword.length);
    const hashedSupplied = createHash('sha256').update(suppliedPassword).digest('hex');
    console.log("Supplied password hash length:", hashedSupplied.length);
    console.log("Hashes match:", hashedSupplied === storedPassword);
    return hashedSupplied === storedPassword;
  }
};

export function setupAuth(app: Express) {
  const MemoryStore = createMemoryStore(session);
  const sessionSettings: session.SessionOptions = {
    secret: process.env.REPL_ID || "nomad-platform-secret",
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      sameSite: 'lax',
      path: '/'
    },
    store: new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    }),
  };

  // Always trust the proxy in Replit environment
  app.set("trust proxy", 1);
  
  // Don't set secure cookie in development to work with http
  // In Replit's environment, we'll use secure cookies only if not in development mode
  if (app.get("env") === "production") {
    sessionSettings.cookie = { 
      ...sessionSettings.cookie,
      secure: true 
    };
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (usernameOrEmail, password, done) => {
      try {
        console.log("Login attempt for usernameOrEmail:", usernameOrEmail);
        
        // Check if the input is an email (contains @)
        const isEmail = usernameOrEmail.includes('@');
        
        // Search by either username or email
        const [user] = await db
          .select()
          .from(users)
          .where(isEmail ? eq(users.email, usernameOrEmail) : eq(users.username, usernameOrEmail))
          .limit(1);

        if (!user) {
          console.log("No user found with", isEmail ? "email" : "username", ":", usernameOrEmail);
          return done(null, false, { message: "Invalid username/email or password." });
        }

        console.log("Found user:", { id: user.id, username: user.username });
        const isMatch = await crypto.compare(password, user.password);

        if (!isMatch) {
          console.log("Password mismatch for user:", usernameOrEmail);
          return done(null, false, { message: "Invalid username/email or password." });
        }

        console.log("Login successful for user:", usernameOrEmail);
        return done(null, user);
      } catch (err) {
        console.error("Login error:", err);
        return done(err);
      }
    })
  );

  passport.serializeUser((user, done) => {
    console.log("Serializing user:", user.id);
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      console.log("Deserializing user:", id);
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      console.log("Deserialized user found:", !!user);
      done(null, user);
    } catch (err) {
      console.error("Deserialization error:", err);
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      console.log("Registration attempt:", req.body);
      const { 
        username, 
        email,
        password, 
        fullName, 
        bio, 
        location, 
        interests,
        profession,
        profileImage,
        currentMoods,
        age,
        gender,
        nextLocation
      } = req.body;

      if (!username || !password || !email) {
        return res.status(400).send("Username, email, and password are required");
      }

      if (username.length < 3) {
        return res.status(400).send("Username must be at least 3 characters long");
      }

      if (password.length < 6) {
        return res.status(400).send("Password must be at least 6 characters long");
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).send("Please enter a valid email address");
      }

      // Check if username already exists
      const [existingUsername] = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (existingUsername) {
        return res.status(400).send("Username already exists");
      }
      
      // Check if email already exists
      const [existingEmail] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingEmail) {
        return res.status(400).send("Email address already in use");
      }

      // Hash the password
      const hashedPassword = await crypto.hash(password);
      console.log("Password hashed successfully for new user");

      // Ensure interests and moods are always arrays or null
      const processedInterests = interests && Array.isArray(interests) ? interests : null;
      const processedMoods = currentMoods && Array.isArray(currentMoods) ? currentMoods : null;

      // Create additional user metadata
      const userData = {
        profession: profession || null,
        age: age ? Number(age) : null,
        gender: gender || null,
        nextLocation: nextLocation || null
      };

      // Create user with extended fields
      try {
        const [newUser] = await db
          .insert(users)
          .values({
            username,
            email,
            password: hashedPassword,
            fullName: fullName || null,
            bio: bio || null,
            location: location || null,
            interests: processedInterests,
            profileImage: profileImage || null,
            // Add new fields if they're supported in the schema
            ...userData
          })
          .returning();

        console.log("User registered successfully:", username);

        req.login(newUser, (err) => {
          if (err) {
            console.error("Login after registration failed:", err);
            return next(err);
          }
          return res.json(newUser);
        });
      } catch (dbError) {
        console.error("Database error during registration:", dbError);
        return res.status(500).send("Error creating user account");
      }
    } catch (error) {
      console.error("Registration error:", error);
      next(error);
    }
  });
  
  // Add a direct registration-with-redirect endpoint
  app.post("/api/register-redirect", async (req, res) => {
    try {
      console.log("Registration+redirect attempt:", req.body);
      const { 
        username, 
        email,
        password, 
        fullName, 
        bio, 
        location, 
        interests,
        profession,
        profileImage,
        currentMoods,
        age,
        gender,
        nextLocation
      } = req.body;

      // Basic validation
      if (!username || !password || !email) {
        return res.redirect('/auth?error=Required+fields+missing');
      }

      if (username.length < 3) {
        return res.redirect('/auth?error=Username+too+short');
      }

      if (password.length < 6) {
        return res.redirect('/auth?error=Password+too+short');
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.redirect('/auth?error=Invalid+email+format');
      }

      // Check if username already exists
      const [existingUsername] = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (existingUsername) {
        return res.redirect('/auth?error=Username+already+exists');
      }
      
      // Check if email already exists
      const [existingEmail] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingEmail) {
        return res.redirect('/auth?error=Email+already+in+use');
      }

      // Hash the password
      const hashedPassword = await crypto.hash(password);

      // Process interests - handle string or JSON format
      let processedInterests = null;
      if (interests) {
        if (typeof interests === 'string') {
          // Check if it's a JSON string
          if (interests.startsWith('[') && interests.endsWith(']')) {
            try {
              processedInterests = JSON.parse(interests);
            } catch (e) {
              // If it's not valid JSON, assume it's comma-separated
              processedInterests = interests.split(',').map((i: string) => i.trim());
            }
          } else {
            // Assume comma-separated string
            processedInterests = interests.split(',').map((i: string) => i.trim());
          }
        } else if (Array.isArray(interests)) {
          processedInterests = interests;
        }
      }

      // Create additional user metadata
      const userData = {
        profession: profession || null,
        age: age ? Number(age) : null,
        gender: gender || null,
        nextLocation: nextLocation || null
      };

      try {
        const [newUser] = await db
          .insert(users)
          .values({
            username,
            email,
            password: hashedPassword,
            fullName: fullName || null,
            bio: bio || null,
            location: location || null,
            interests: processedInterests,
            profileImage: profileImage || null,
            ...userData
          })
          .returning();

        console.log("User registered successfully for redirect flow:", username);

        req.login(newUser, (err) => {
          if (err) {
            console.error("Login after registration failed in redirect flow:", err);
            return res.redirect('/auth?error=Authentication+failed+after+registration');
          }

          // Save session and redirect
          req.session.save((err) => {
            if (err) {
              console.error("Session save error during redirect flow:", err);
              return res.redirect('/auth?error=Session+error');
            }
            
            console.log("Registration successful, redirecting to homepage");
            return res.redirect('/');
          });
        });
      } catch (dbError) {
        console.error("Database error during registration redirect flow:", dbError);
        return res.redirect('/auth?error=Failed+to+create+account');
      }
    } catch (error) {
      console.error("Registration error in redirect flow:", error);
      return res.redirect('/auth?error=Registration+failed');
    }
  });

  app.post("/api/login", (req, res, next) => {
    const usernameOrEmail = req.body.username; // We keep the parameter name as 'username' for backward compatibility
    console.log("Login attempt:", { usernameOrEmail });

    if (!usernameOrEmail || !req.body.password) {
      return res.status(400).send("Email/username and password are required");
    }

    passport.authenticate("local", (err: any, user: Express.User, info: IVerifyOptions) => {
      console.log("Passport auth result:", { err, user: !!user, info });

      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(400).send(info.message ?? "Invalid email/username or password");
      }

      req.logIn(user, (err) => {
        if (err) {
          console.error("Login error:", err);
          return next(err);
        }
        
        // Save session explicitly to ensure it's stored before responding
        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            return next(err);
          }
          
          // Sanitize the user object before sending it (remove password)
          const { password, ...userWithoutPassword } = user as any;
          
          console.log("Login successful, session established");
          return res.json(userWithoutPassword);
        });
      });
    })(req, res, next);
  });
  
  // Add a direct login-with-redirect endpoint for form submission
  app.post("/api/login-redirect", (req, res, next) => {
    const usernameOrEmail = req.body.username;
    console.log("Login+redirect attempt:", { usernameOrEmail });

    if (!usernameOrEmail || !req.body.password) {
      return res.redirect('/auth?error=Email/username+and+password+are+required');
    }

    passport.authenticate("local", (err: any, user: Express.User, info: IVerifyOptions) => {
      if (err) {
        console.error("Login error during redirect flow:", err);
        return res.redirect('/auth?error=Server+error+occurred');
      }

      if (!user) {
        console.log("Failed login during redirect flow:", info?.message);
        return res.redirect('/auth?error=Invalid+credentials');
      }

      req.logIn(user, (err) => {
        if (err) {
          console.error("Login error during redirect flow:", err);
          return res.redirect('/auth?error=Authentication+failed');
        }
        
        // Save session and redirect
        req.session.save((err) => {
          if (err) {
            console.error("Session save error during redirect flow:", err);
            return res.redirect('/auth?error=Session+error');
          }
          
          console.log("Login successful, redirecting to homepage");
          return res.redirect('/');
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    const username = req.user?.username;
    console.log("Logout attempt for user:", username);
    
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).send("Logout failed");
      }
      
      // Destroy the session completely for a clean logout
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destroy error:", err);
          // Continue anyway as the user is already logged out
        }
        
        // Clear the cookie on the client
        res.clearCookie('connect.sid', {
          path: '/',
          httpOnly: true,
          sameSite: 'lax'
        });
        
        console.log("Logout successful for user:", username);
        res.json({ message: "Logged out successfully" });
      });
    });
  });

  app.get("/api/user", (req, res) => {
    // Log session ID for debugging
    console.log("Session ID in /api/user:", req.sessionID);
    
    // Check authentication directly rather than trying to reload the session
    if (req.isAuthenticated() && req.user) {
      const user = req.user;
      console.log("Authenticated user request:", user.username);
      
      // Sanitize user object to remove sensitive info (like password)
      const { password, ...userWithoutPassword } = user as any;
      
      return res.json(userWithoutPassword);
    }
    
    console.log("Unauthenticated user request");
    res.status(401).send("Not authenticated");
  });

  // Add endpoint for updating user profiles
  app.post("/api/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const userId = req.user?.id;
      const updatedFields = req.body;
      
      // Remove sensitive fields that shouldn't be updated directly
      const { password, id, ...safeFields } = updatedFields;
      
      // Process arrays
      if (safeFields.interests && Array.isArray(safeFields.interests)) {
        safeFields.interests = safeFields.interests.length > 0 ? safeFields.interests : null;
      }
      
      if (safeFields.currentMoods && Array.isArray(safeFields.currentMoods)) {
        safeFields.currentMoods = safeFields.currentMoods.length > 0 ? safeFields.currentMoods : null;
      }
      
      // Update the user
      const [updatedUser] = await db
        .update(users)
        .set(safeFields)
        .where(eq(users.id, userId))
        .returning();
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).send("Failed to update profile");
    }
  });

  // Add endpoint to check for Replit environment
  app.get("/api/replit-info", (req, res) => {
    // Check if we're running in a Replit environment
    const isReplitEnv = process.env.REPL_ID && process.env.REPL_OWNER;
    
    if (isReplitEnv) {
      res.json({
        isReplit: true,
        replId: process.env.REPL_ID,
        owner: process.env.REPL_OWNER,
        slug: process.env.REPL_SLUG
      });
    } else {
      res.json({
        isReplit: false
      });
    }
  });
}