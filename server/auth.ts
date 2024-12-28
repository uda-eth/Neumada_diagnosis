import passport from "passport";
import { IVerifyOptions, Strategy as LocalStrategy } from "passport-local";
import { type Express } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import { createHash } from "crypto";
import { users, type User } from "@db/schema";
import { db } from "@db";
import { eq } from "drizzle-orm";

// Simplified password hashing for demo purposes
const crypto = {
  hash: async (password: string): Promise<string> => {
    return createHash('sha256').update(password).digest('hex');
  },
  compare: async (suppliedPassword: string, storedPassword: string): Promise<boolean> => {
    const hashedSupplied = await createHash('sha256').update(suppliedPassword).digest('hex'); //Added await here
    return hashedSupplied === storedPassword;
  }
};

declare global {
  namespace Express {
    interface User extends User {}
  }
}

export function setupAuth(app: Express) {
  const MemoryStore = createMemoryStore(session);
  const sessionSettings: session.SessionOptions = {
    secret: process.env.REPL_ID || "nomad-platform-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
    store: new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    }),
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
    sessionSettings.cookie = { 
      ...sessionSettings.cookie,
      secure: true 
    };
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log("Attempting login for username:", username);
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.username, username))
          .limit(1);

        if (!user) {
          console.log("No user found with username:", username);
          return done(null, false, { message: "Invalid username or password." });
        }

        const isMatch = await crypto.compare(password, user.password); //Added await here
        if (!isMatch) {
          console.log("Password mismatch for username:", username);
          return done(null, false, { message: "Invalid username or password." });
        }

        console.log("Login successful for username:", username);
        return done(null, user);
      } catch (err) {
        console.error("Login error:", err);
        return done(err);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      console.log("Registration attempt:", req.body);
      const { username, password, fullName, bio, location, interests } = req.body;

      if (!username || !password) {
        return res.status(400).send("Username and password are required");
      }

      if (username.length < 3) {
        return res.status(400).send("Username must be at least 3 characters long");
      }

      if (password.length < 6) {
        return res.status(400).send("Password must be at least 6 characters long");
      }

      // Check if user already exists
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (existingUser) {
        return res.status(400).send("Username already exists");
      }

      // Hash the password
      const hashedPassword = await crypto.hash(password);

      // Ensure interests is always an array or null
      const processedInterests = interests && Array.isArray(interests) ? interests : null;

      try {
        const [newUser] = await db
          .insert(users)
          .values({
            username,
            password: hashedPassword,
            fullName: fullName || null,
            bio: bio || null,
            location: location || null,
            interests: processedInterests,
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

  app.post("/api/login", (req, res, next) => {
    console.log("Login attempt:", req.body);

    if (!req.body.username || !req.body.password) {
      return res.status(400).send("Username and password are required");
    }

    passport.authenticate("local", (err: any, user: Express.User, info: IVerifyOptions) => {
      console.log("Passport auth result:", { err, user, info });

      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(400).send(info.message ?? "Invalid username or password");
      }

      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).send("Logout failed");
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user;
      return res.json(user);
    }
    res.status(401).send("Not authenticated");
  });
}