# Development Guide

This document provides developers with detailed instructions for setting up the development environment, following best practices, and understanding the development workflow for the Maly social networking platform.

## Development Environment Setup

### Prerequisites

1. **Node.js 20.x**
   - Required for running the application
   - Download from [nodejs.org](https://nodejs.org/)

2. **PostgreSQL 16**
   - Required for the database
   - Download from [postgresql.org](https://www.postgresql.org/download/)
   - Create a database for the application

3. **Git**
   - Required for version control
   - Download from [git-scm.com](https://git-scm.com/downloads)

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd maly
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/maly
   SESSION_SECRET=your_session_secret
   PORT=5000
   
   # For Stripe integration
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   
   # For OpenAI integration
   OPENAI_API_KEY=your_openai_api_key
   
   # For Twilio integration (optional)
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```
   This will start both the frontend and backend servers.

## Development Workflow

### Directory Structure

```
project-root/
│
├── client/                  # Frontend code
│   ├── src/
│   │   ├── assets/          # Static assets (images, fonts)
│   │   ├── components/      # Reusable React components
│   │   │   ├── ui/          # UI components (based on shadcn/ui)
│   │   │   └── ...
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility functions and providers
│   │   ├── pages/           # Page components
│   │   ├── App.tsx          # Main App component
│   │   └── main.tsx         # Entry point
│   └── index.html           # HTML template
│
├── db/                      # Database setup
│   ├── schema.ts            # Drizzle schema definition
│   ├── index.ts             # Database connection
│   └── create-tables.ts     # Table creation utilities
│
├── server/                  # Backend code
│   ├── routes.ts            # API routes
│   ├── app.ts               # Express app setup
│   ├── vite.ts              # Vite configuration
│   └── index.ts             # Server entry point
│
├── uploads/                 # Uploaded files directory
│
├── migrations/              # Database migrations
│
├── .env                     # Environment variables
├── drizzle.config.ts        # Drizzle ORM configuration
├── package.json             # Project dependencies
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite configuration
```

### Frontend Development

#### Adding a New Page

1. Create a new file in `client/src/pages/` directory with naming format `YourPageName.tsx`
2. Add the component to the routes in `client/src/App.tsx`

Example:
```tsx
// client/src/pages/NewFeaturePage.tsx
export default function NewFeaturePage() {
  return (
    <div>
      <h1>New Feature</h1>
      {/* Page content */}
    </div>
  );
}

// In client/src/App.tsx
<Route path="/new-feature" component={NewFeaturePage} />
```

#### State Management

1. **Local State**: Use React's `useState` and `useReducer` hooks for component-level state
2. **Server State**: Use React Query (`@tanstack/react-query`) for API data fetching and caching
3. **Global State**: Use Zustand for application-wide state management

Example with React Query:
```tsx
import { useQuery } from '@tanstack/react-query';

function ProfileComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/users/profile'],
    queryFn: () => fetch('/api/users/profile').then(res => res.json())
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error fetching profile</div>;

  return <div>{data.username}</div>;
}
```

#### Form Handling

Always use `react-hook-form` with the shadcn UI form components:

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
});

export function ProfileForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
    },
  });

  function onSubmit(values) {
    // Handle form submission
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* More form fields */}
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

### Backend Development

#### Adding a New API Endpoint

1. Open `server/routes.ts`
2. Add a new route using Express router

Example:
```ts
// Add a new endpoint
app.get("/api/featured-events", async (req, res) => {
  try {
    const featuredEvents = await db
      .select()
      .from(events)
      .where(eq(events.isFeatured, true))
      .limit(5);
    
    res.json(featuredEvents);
  } catch (error) {
    console.error("Error fetching featured events:", error);
    res.status(500).json({ error: "Failed to fetch featured events" });
  }
});
```

#### Database Operations

Always use Drizzle ORM for database operations:

```ts
import { db } from "@db";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";

// Query example
const user = await db
  .select()
  .from(users)
  .where(eq(users.username, username))
  .limit(1);

// Insert example
const newUser = await db
  .insert(users)
  .values({
    username,
    email,
    password: hashedPassword,
  })
  .returning();

// Update example
const updatedUser = await db
  .update(users)
  .set({ fullName: newFullName })
  .where(eq(users.id, userId))
  .returning();

// Delete example
await db
  .delete(users)
  .where(eq(users.id, userId));
```

#### Database Schema Changes

1. Modify the schema in `db/schema.ts`
2. Run `npm run db:push` to update the database

Example schema change:
```ts
// Add a new field to users table
export const users = pgTable("users", {
  // Existing fields...
  verificationCode: text("verification_code"),
  verificationExpires: timestamp("verification_expires"),
});
```

## Testing and Quality Assurance

### Manual Testing

1. Test new features in the development environment
2. Verify all user flows work as expected
3. Test on different screen sizes for responsive design
4. Test with different user roles (regular user, admin)

### Automated Testing

The project uses Jest for testing. To run tests:

```bash
npm test
```

To create a new test:

1. Create a file with the `.test.ts` or `.test.tsx` extension
2. Write your tests using Jest

Example test:
```tsx
import { render, screen } from '@testing-library/react';
import HomePage from './HomePage';

test('renders homepage title', () => {
  render(<HomePage />);
  const titleElement = screen.getByText(/welcome to maly/i);
  expect(titleElement).toBeInTheDocument();
});
```

## Debugging

### Frontend Debugging

1. Use React Developer Tools browser extension
2. Use `console.log` for quick debugging
3. Check the browser's network tab to verify API calls

### Backend Debugging

1. Use `console.log` for debugging
2. Check server logs in the terminal
3. For database issues, verify queries using the Drizzle debug mode

### Common Issues

1. **Authentication issues**: Check session configuration and cookies
2. **Database connection issues**: Verify the DATABASE_URL is correct
3. **API errors**: Check the request format and authentication status

## Performance Optimization

### Frontend Optimization

1. Use React.memo for expensive components
2. Implement proper code-splitting with dynamic imports
3. Optimize images before uploading them
4. Use React Query's caching capabilities

### Backend Optimization

1. Implement database indexes for frequently queried columns
2. Use proper pagination for large data sets
3. Implement request rate limiting for public endpoints

## Deployment

See [README.md](./README.md#deployment) for deployment instructions.

## Additional Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [React Query Documentation](https://tanstack.com/query/latest)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)