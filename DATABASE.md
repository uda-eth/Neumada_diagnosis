# Database Schema Documentation

This document provides detailed information about the database schema used in the Maly social networking platform.

## Overview

Maly uses a PostgreSQL database with Drizzle ORM for data modeling and database interactions. The schema is designed to support all the features of a modern social networking platform, including user profiles, social connections, events, messaging, and premium subscriptions.

## Tables

### Users

The core table storing user information.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| username | text | User's unique username |
| email | text | User's email address |
| password | text | Hashed password |
| full_name | text | User's full name |
| bio | text | User's biography |
| profile_image | text | URL to profile image |
| cover_image | text | URL to cover image |
| current_city | text | User's current city |
| interests | jsonb | Array of user interests |
| currentMoods | jsonb | Array of user's current moods |
| role | text | User role (user, admin) |
| created_at | timestamp | Account creation timestamp |
| updated_at | timestamp | Last update timestamp |
| is_verified | boolean | Email verification status |
| premium_status | text | Premium subscription status |
| language_preference | text | Preferred language |

### User Connections

Tracks connections (follows) between users.

| Column | Type | Description |
|--------|------|-------------|
| follower_id | integer | ID of the follower user |
| following_id | integer | ID of the followed user |
| status | text | Connection status (pending, accepted, declined) |
| created_at | timestamp | When the connection was created |

### Events

Stores event information.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| title | text | Event title |
| description | text | Event description |
| city | text | Event city |
| location | text | Specific event location |
| organizer_id | integer | User ID of event organizer |
| start_date | timestamp | Event start date/time |
| end_date | timestamp | Event end date/time |
| image_url | text | Event image URL |
| price | numeric | Event ticket price |
| capacity | integer | Maximum attendees |
| created_at | timestamp | Event creation timestamp |
| is_private | boolean | Whether the event is private |
| is_business_event | boolean | Whether it's a business event |
| tags | jsonb | Event tags |
| attending_count | integer | Number of attendees |
| interested_count | integer | Number of interested users |
| time_frame | text | Time frame description |
| stripe_product_id | text | Stripe product ID for payments |
| stripe_price_id | text | Stripe price ID for payments |

### Event Participants

Tracks users attending events.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| event_id | integer | Event ID |
| user_id | integer | User ID |
| status | text | Participation status (attending, interested) |
| payment_status | text | Payment status |
| ticket_identifier | text | Unique ticket identifier |
| created_at | timestamp | Record creation timestamp |

### Messages

Stores direct messages between users.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| sender_id | integer | Sender user ID |
| recipient_id | integer | Recipient user ID |
| content | text | Message content |
| read | boolean | Read status |
| created_at | timestamp | Message timestamp |

### Sessions

Manages user sessions.

| Column | Type | Description |
|--------|------|-------------|
| id | text | Primary key (session ID) |
| user_id | integer | User ID |
| expires_at | timestamp | Session expiration time |
| created_at | timestamp | Session creation time |

### User Cities

Tracks cities associated with users.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| user_id | integer | User ID |
| city | text | City name |
| is_current | boolean | Whether it's the current city |
| is_primary | boolean | Whether it's the primary city |

### Invitations

Tracks invitations/referrals to the platform.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| inviter_id | integer | User ID of the inviter |
| email | text | Invitee's email |
| code | text | Unique invitation code |
| status | text | Invitation status (pending, accepted, expired) |
| created_at | timestamp | Creation timestamp |
| expires_at | timestamp | Expiration timestamp |
| invitee_id | integer | User ID of the invitee (when accepted) |

### Payments

Tracks payments for events and subscriptions.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| user_id | integer | User ID |
| event_id | integer | Event ID (for event tickets) |
| amount | numeric | Payment amount |
| currency | text | Payment currency |
| status | text | Payment status |
| stripe_charge_id | text | Stripe charge ID |
| stripe_checkout_session_id | text | Stripe checkout session ID |
| created_at | timestamp | Payment timestamp |
| event_participant_id | integer | Related event participant record |

### Subscriptions

Tracks premium subscriptions.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| user_id | integer | User ID |
| status | text | Subscription status |
| plan_type | text | Subscription plan type |
| start_date | timestamp | Subscription start date |
| end_date | timestamp | Subscription end date |
| stripe_subscription_id | text | Stripe subscription ID |
| created_at | timestamp | Record creation timestamp |

### Subscription Payments

Tracks payments for premium subscriptions.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| subscription_id | integer | Related subscription ID |
| user_id | integer | User ID |
| amount | numeric | Payment amount |
| currency | text | Payment currency |
| status | text | Payment status |
| stripe_payment_intent_id | text | Stripe payment intent ID |
| created_at | timestamp | Payment timestamp |

## Relationships

### User Relationships
- Users can follow other users (user_connections)
- Users can organize events (events.organizer_id)
- Users can participate in events (event_participants)
- Users can send and receive messages (messages)
- Users can have multiple associated cities (user_cities)
- Users can have premium subscriptions (subscriptions)

### Event Relationships
- Events have organizers (users)
- Events have participants (event_participants)
- Events can have payments (payments)

### Subscription Relationships
- Subscriptions belong to users (users)
- Subscriptions have payment records (subscription_payments)

## Database Migrations

Migrations are managed through Drizzle ORM. The database schema is defined in `db/schema.ts` and migrations are generated and applied using Drizzle Kit.

### Running Migrations

To push schema changes to the database:
```
npm run db:push
```

### Database Reset

For development purposes, the database can be reset using:
```
node run-reset-db.js
```

**Warning**: This will delete all data in the database.

## Best Practices

1. Always use the Drizzle ORM for database operations
2. Never perform direct SQL operations on the database unless absolutely necessary
3. Document all schema changes in pull requests
4. Use migrations for schema changes in production
5. Never store sensitive data in plaintext (passwords should be hashed)
6. Include proper indexes for frequently queried columns
7. Use transactions for operations that modify multiple tables