# Maly - Social Networking Platform

Maly is a cutting-edge social networking platform designed to revolutionize professional connections through intelligent, AI-powered interactions and dynamic city exploration.

## 📋 Features

- **User Authentication**: Sign up, log in, and secure session management
- **Profile Management**: Create and edit detailed user profiles
- **Events Platform**: Create, browse, and attend local events
- **Social Connections**: Follow users and build your professional network
- **Direct Messaging**: Real-time communication with other users
- **AI Companion**: Intelligent assistant for personalized recommendations
- **Premium Subscriptions**: Enhanced features for premium users
- **Event Ticketing**: Purchase and manage event tickets
- **City Exploration**: Discover local events and activities
- **Multilingual Support**: Translator functionality for global communication

## 🛠️ Technologies Used

### Frontend
- **React** - Frontend framework
- **Wouter** - Lightweight routing solution
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - Component library based on Radix UI
- **React Query** - Data fetching and state management
- **Zod** - TypeScript-first schema validation

### Backend
- **Node.js/Express** - Server framework
- **PostgreSQL** - Relational database
- **Drizzle ORM** - TypeScript ORM for database interactions
- **Passport.js** - Authentication middleware
- **WebSockets** - Real-time communication
- **Express Session** - Session management

### Third-Party APIs
- **OpenAI** - AI-powered recommendations and features
- **Stripe** - Payment processing for tickets and premium subscriptions
- **Twilio** - SMS notifications

### DevOps
- **Replit** - Development and deployment platform
- **Replit Object Storage** - Media file storage
- **Replit Deployments** - Automated deployment

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm 9.x or higher
- PostgreSQL 16 database

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file at the root of the project with the following variables:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/maly
   SESSION_SECRET=your_session_secret
   PORT=5000
   STRIPE_SECRET_KEY=your_stripe_secret_key
   OPENAI_API_KEY=your_openai_api_key
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   ```

4. Set up the database:
   ```
   npm run db:push
   ```

5. Start the development server:
   ```
   npm run dev
   ```

The application will be available at http://localhost:5000

## 🔄 Development Workflow

### Running the Application Locally

1. Start the development server:
   ```
   npm run dev
   ```

   This command runs both the frontend and backend in development mode.

2. Build the application for production:
   ```
   npm run build
   ```

3. Start the production server:
   ```
   npm start
   ```

### Database Management

- Push schema changes to the database:
  ```
  npm run db:push
  ```

- Reset the database (caution: this will delete all data):
  ```
  node run-reset-db.js
  ```

## 📤 Deployment

### Deploying to Replit

1. Ensure your code is committed to the repository

2. Click the "Deploy" button in the Replit interface

3. Replit Deployments will automatically handle:
   - Building the application
   - Hosting the application
   - TLS/SSL setup
   - Health checks

4. Once deployed, your app will be available at your `.replit.app` domain or a custom domain if configured

### Environment Variables for Production

Ensure the following environment variables are set in your Replit Secrets:

- `DATABASE_URL`
- `SESSION_SECRET`
- `STRIPE_SECRET_KEY`
- `OPENAI_API_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

## 📂 Project Structure

```
project-root/
│
├── client/                  # Frontend code
│   ├── src/
│   │   ├── assets/          # Static assets
│   │   ├── components/      # React components
│   │   │   ├── ui/          # Shadcn UI components
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
├── .env                     # Environment variables
├── drizzle.config.ts        # Drizzle ORM configuration
├── package.json             # Project dependencies
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite configuration
```

## 🌿 Branch Structure

- `main` - Production-ready code
- `staging` - Pre-production testing
- `development` - Active development branch
- Feature branches should be created from `development` with the naming convention `feature/feature-name`
- Bugfix branches should be created with the naming convention `bugfix/bug-name`

## 👥 Contributing

1. Create a new branch from `development`
2. Make your changes
3. Push your branch and create a pull request
4. Ensure all checks pass before merging

## ⚠️ Important Notes

- Never directly modify the database schema in production; always use the Drizzle ORM
- Keep sensitive information in environment variables, never commit them to the repository
- Run tests before submitting pull requests
- Document any significant changes to the codebase

## 📄 License

This project is proprietary and confidential. All rights reserved.

## 🙏 Acknowledgements

- Replit for providing the development and deployment platform
- OpenAI for powering intelligent features
- All the open-source libraries that make this project possible