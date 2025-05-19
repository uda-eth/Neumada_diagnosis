# API Documentation

This document provides a comprehensive overview of the API endpoints available in the Maly social networking platform.

## Base URL

When running locally: `http://localhost:5000/api`
When deployed: `https://<your-domain>/api`

## Authentication

Most endpoints require authentication. The application uses session-based authentication.

### Authentication Endpoints

#### Register

- **URL**: `/auth/register`
- **Method**: `POST`
- **Description**: Register a new user
- **Request Body**:
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string",
    "fullName": "string"
  }
  ```
- **Response**: User object with session token

#### Login

- **URL**: `/auth/login`
- **Method**: `POST`
- **Description**: Log in existing user
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response**: User object with session token

#### Logout

- **URL**: `/auth/logout`
- **Method**: `POST`
- **Description**: Log out current user
- **Response**: Success message

#### Check Authentication

- **URL**: `/auth/check`
- **Method**: `GET`
- **Description**: Check if current user is authenticated
- **Response**: Authentication status and user information if authenticated

#### Verify User

- **URL**: `/verify-user`
- **Method**: `POST`
- **Description**: Verify if a user ID exists
- **Request Body**:
  ```json
  {
    "userId": "number"
  }
  ```
- **Response**: Validation status

## User Endpoints

#### Get User by ID

- **URL**: `/users/:id`
- **Method**: `GET`
- **Description**: Get user by ID
- **Response**: User object

#### Get User by Session

- **URL**: `/user-by-session`
- **Method**: `GET`
- **Description**: Get current user by session ID
- **Query Parameters**:
  - `sessionId`: Session ID (optional, can be taken from session cookie)
- **Response**: User object with authentication status

#### Update Profile

- **URL**: `/profile`
- **Method**: `POST`
- **Description**: Update user profile
- **Authentication**: Required
- **Request Body**: Object with profile fields to update
  ```json
  {
    "fullName": "string",
    "bio": "string",
    "currentCity": "string",
    "interests": ["string"],
    "currentMoods": ["string"],
    "languagePreference": "string"
  }
  ```
- **Response**: Updated user object

## Event Endpoints

#### Get Events

- **URL**: `/events`
- **Method**: `GET`
- **Description**: Get all events or filter by location
- **Query Parameters**:
  - `location`: Filter by location (default: "all")
- **Response**: Array of event objects

#### Get Event by ID

- **URL**: `/events/:id`
- **Method**: `GET`
- **Description**: Get event by ID
- **Response**: Event object

#### Create Event

- **URL**: `/events`
- **Method**: `POST`
- **Description**: Create a new event
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "title": "string",
    "description": "string",
    "city": "string",
    "location": "string",
    "startDate": "date",
    "endDate": "date",
    "imageUrl": "string",
    "price": "number",
    "capacity": "number",
    "isPrivate": "boolean",
    "isBusinessEvent": "boolean",
    "tags": ["string"],
    "timeFrame": "string"
  }
  ```
- **Response**: Created event object

#### Update Event

- **URL**: `/events/:id`
- **Method**: `PUT`
- **Description**: Update an existing event
- **Authentication**: Required (must be organizer)
- **Request Body**: Object with event fields to update
- **Response**: Updated event object

#### Delete Event

- **URL**: `/events/:id`
- **Method**: `DELETE`
- **Description**: Delete an event
- **Authentication**: Required (must be organizer)
- **Response**: Success message

#### Event Participation

- **URL**: `/events/:id/participate`
- **Method**: `POST`
- **Description**: Attend or show interest in an event
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "status": "attending|interested"
  }
  ```
- **Response**: Updated participation status

## Connection Endpoints

#### Get Connections

- **URL**: `/connections`
- **Method**: `GET`
- **Description**: Get user's connections (followers and following)
- **Authentication**: Required
- **Response**: Array of connection objects

#### Follow User

- **URL**: `/connections/follow`
- **Method**: `POST`
- **Description**: Follow another user
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "followingId": "number"
  }
  ```
- **Response**: Connection status

#### Unfollow User

- **URL**: `/connections/unfollow`
- **Method**: `POST`
- **Description**: Unfollow a user
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "followingId": "number"
  }
  ```
- **Response**: Success message

#### Connection Status

- **URL**: `/connections/status/:userId`
- **Method**: `GET`
- **Description**: Get connection status with a user
- **Authentication**: Required
- **Response**: Connection status

## Messaging Endpoints

#### Get Messages

- **URL**: `/messages`
- **Method**: `GET`
- **Description**: Get all conversations
- **Authentication**: Required
- **Response**: Array of conversation objects

#### Get Conversation

- **URL**: `/messages/:userId`
- **Method**: `GET`
- **Description**: Get conversation with a specific user
- **Authentication**: Required
- **Response**: Array of message objects

#### Send Message

- **URL**: `/messages`
- **Method**: `POST`
- **Description**: Send a message to another user
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "recipientId": "number",
    "content": "string"
  }
  ```
- **Response**: Created message object

#### Mark Message as Read

- **URL**: `/messages/:id/read`
- **Method**: `POST`
- **Description**: Mark a message as read
- **Authentication**: Required
- **Response**: Updated message object

## Premium Subscription Endpoints

#### Get Subscription Status

- **URL**: `/subscriptions/status`
- **Method**: `GET`
- **Description**: Get current user's subscription status
- **Authentication**: Required
- **Response**: Subscription status

#### Create Subscription Checkout

- **URL**: `/subscriptions/create-checkout`
- **Method**: `POST`
- **Description**: Create a checkout session for premium subscription
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "planType": "monthly|annual"
  }
  ```
- **Response**: Stripe checkout session URL

#### Handle Subscription Webhook

- **URL**: `/subscriptions/webhook`
- **Method**: `POST`
- **Description**: Handle Stripe subscription webhook events
- **Request Body**: Stripe webhook event
- **Response**: Success acknowledgment

## Event Ticket Endpoints

#### Create Ticket Checkout

- **URL**: `/events/:id/create-checkout`
- **Method**: `POST`
- **Description**: Create a checkout session for event tickets
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "quantity": "number"
  }
  ```
- **Response**: Stripe checkout session URL

#### Get Tickets

- **URL**: `/tickets`
- **Method**: `GET`
- **Description**: Get user's event tickets
- **Authentication**: Required
- **Response**: Array of ticket objects

#### Verify Ticket

- **URL**: `/tickets/verify/:ticketId`
- **Method**: `GET`
- **Description**: Verify a ticket's validity
- **Authentication**: Required (organizer or admin)
- **Response**: Ticket verification status

## Companion AI Endpoints

#### Chat with Companion

- **URL**: `/companion/chat`
- **Method**: `POST`
- **Description**: Send a message to the AI companion
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "message": "string",
    "contextCity": "string"
  }
  ```
- **Response**: AI companion response

#### Get Recommendations

- **URL**: `/companion/recommendations`
- **Method**: `GET`
- **Description**: Get personalized recommendations
- **Authentication**: Required
- **Query Parameters**:
  - `type`: Recommendation type (events, connections, etc.)
  - `city`: City for contextual recommendations
- **Response**: Array of recommendation objects

## System Information Endpoints

#### Replit Info

- **URL**: `/replit-info`
- **Method**: `GET`
- **Description**: Get information about the Replit environment
- **Response**: Replit environment details

## Error Responses

All API endpoints follow a consistent error response format:

- **400 Bad Request**: Invalid request parameters
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

Example error response:
```json
{
  "error": "Error message describing the issue",
  "status": 400
}
```

## Best Practices

1. Always include authentication headers for protected endpoints
2. Handle errors gracefully in the client application
3. Implement proper rate limiting and pagination for production use
4. Cache API responses when appropriate to improve performance