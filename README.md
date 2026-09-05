# AI Multilingual Communication Platform

A full-stack web application for planning, translating, executing, and analyzing multilingual communication campaigns across targeted audiences.

> **Project:** AI Multilingual Communication Platform  
> **Purpose:** Centralized multilingual communication, campaign management, audience segmentation, message tracking, translation, scheduling, and analytics.

---

## Overview

The **AI Multilingual Communication Platform** helps organizations manage communication campaigns for different audience groups from a single dashboard.

The platform combines:

- Audience management with demographic information and recipient records
- Campaign creation, editing, scheduling, execution, and status tracking
- Multilingual message translation using DeepL
- Email message delivery using Resend
- Message history and delivery-status management
- Role-based access control for Admin, Campaign Manager, and Communication Team users
- Analytics for campaigns, messages, languages, channels, and audience reach
- Automated scheduled campaign execution using a server-side scheduler

The application follows a **React + Node.js + Express + MongoDB** architecture.

---

## Key Features

### 1. Authentication & Role-Based Access Control

The system uses JWT-based authentication and supports three roles:

| Role | Capabilities |
|---|---|
| **Admin** | Full platform access, including deletion and administration operations |
| **Campaign Manager** | Create/edit/run campaigns, manage recipients, and create/manage audiences |
| **Communication Team** | View campaigns/audiences, manage messages/statuses, perform translations, and access analytics |

Unauthorized actions are rejected by backend role middleware.

---

### 2. Audience Management

Create audience groups using demographic and communication-related fields such as:

- Audience name
- Age
- Gender
- Location
- Language
- Occupation
- Engagement history

Each audience can contain multiple recipients with:

- Name
- Email
- Phone number

Recipient records can be added, edited, and deleted according to the logged-in user's role.

---

### 3. Campaign Management

Campaigns support:

- Campaign name
- Objective
- Message content
- Language
- Communication channel
- Target audience
- Schedule date/time
- Campaign status

Supported campaign statuses:

`Draft` → `Scheduled` → `Active` → `Completed`

Other supported statuses include `Cancelled`.

Campaigns can be manually executed or automatically executed when their scheduled time is reached.

---

### 4. Multilingual Translation

The platform integrates **DeepL** for translation.

Examples tested during development include:

- English → Telugu
- English → Hindi
- English → Malayalam
- Tamil translation workflows

> **Known limitation:** Kannada translation is currently limited by the selected translation-provider support. The application documents this limitation rather than falsely reporting unsupported translation as successful.

Translated text is stored in MongoDB together with:

- Source text
- Source language
- Target language
- Translated text
- Provider
- Translation status
- Timestamps

---

### 5. Message Management

Messages can be created for recipients selected from an audience.

The message workflow includes:

1. Select campaign
2. Select target audience
3. Select recipient
4. Select channel
5. Enter/confirm message
6. Send or record message
7. Track delivery status

Supported message statuses:

- `pending`
- `sent`
- `delivered`
- `failed`

Message records also store timestamps and failure information where applicable.

---

### 6. Email Delivery

The platform integrates **Resend** for real email delivery.

The implemented email flow:

`Campaign/Message → Message Record → Resend API → Recipient Inbox`

Email delivery has been tested successfully using a verified recipient address.

> **Current implementation:** Email is the fully integrated outbound delivery channel. SMS, WhatsApp, and push channels are represented in the application model/workflow but are not fully integrated for live campaign execution.

---

### 7. Scheduled Campaign Execution

The backend includes a server-side scheduler that checks for campaigns whose scheduled time has arrived.

When a scheduled campaign is due, the scheduler:

1. Finds eligible campaigns
2. Changes campaign status to active
3. Executes the campaign
4. Creates message records
5. Sends supported outbound messages
6. Updates message status
7. Marks the campaign as completed

This demonstrates automated campaign execution without requiring manual triggering.

---

### 8. Analytics Dashboard

The analytics module provides a consolidated view of platform activity, including:

- Total campaigns
- Active campaigns
- Scheduled campaigns
- Completed campaigns
- Total messages
- Sent messages
- Delivered messages
- Failed messages
- Pending messages
- Delivery rate
- Messages by channel
- Messages by language
- Translations by language
- Campaign performance
- Audience reach
- Total recipients

The dashboard is designed for operational monitoring and quick decision-making.

---

## Technology Stack

### Frontend

- React
- Vite
- React Router
- Axios
- HTML5 / CSS3

### Backend

- Node.js
- Express.js
- Mongoose
- JWT Authentication
- bcryptjs
- CORS
- dotenv
- node-cron

### Database

- MongoDB

### External Services

- **DeepL** — multilingual translation
- **Resend** — transactional email delivery

---

## Project Architecture

```text
AI-Multilingual-Communication-Platform/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── analyticsController.js
│   │   ├── audienceController.js
│   │   ├── authController.js
│   │   ├── campaignController.js
│   │   ├── messageController.js
│   │   └── translationController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
│   │
│   ├── models/
│   │   ├── Audience.js
│   │   ├── Campaign.js
│   │   ├── Message.js
│   │   ├── Translation.js
│   │   └── User.js
│   │
│   ├── routes/
│   │   ├── analyticsRoutes.js
│   │   ├── audienceRoutes.js
│   │   ├── authRoutes.js
│   │   ├── campaignRoutes.js
│   │   ├── messageRoutes.js
│   │   ├── translationRoutes.js
│   │   └── userRoutes.js
│   │
│   ├── services/
│   │   ├── campaignExecutionService.js
│   │   ├── emailService.js
│   │   └── translationService.js
│   │
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.jsx
│   │   ├── pages/
│   │   │   ├── Analytics.jsx
│   │   │   ├── Audiences.jsx
│   │   │   ├── Campaigns.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Messages.jsx
│   │   │   └── Translations.jsx
│   │   └── services/
│   │       └── api.js
│   ├── package.json
│   └── vite.config.js
│
└── .gitignore
```

---

## API Overview

The backend follows a REST-style API structure.

### Authentication

```text
POST /api/auth/login
```

### Audiences

```text
GET    /api/audiences
POST   /api/audiences
GET    /api/audiences/:id
PUT    /api/audiences/:id
DELETE /api/audiences/:id

POST   /api/audiences/:id/recipients
PUT    /api/audiences/:id/recipients/:recipientId
DELETE /api/audiences/:id/recipients/:recipientId
```

### Campaigns

```text
GET    /api/campaigns
POST   /api/campaigns
GET    /api/campaigns/:id
PUT    /api/campaigns/:id
DELETE /api/campaigns/:id
POST   /api/campaigns/:id/run
```

### Messages

```text
POST   /api/messages
GET    /api/messages
GET    /api/messages/:id
PUT    /api/messages/:id/status
DELETE /api/messages/:id
```

### Translations

```text
POST   /api/translations
POST   /api/translations/translate
GET    /api/translations
GET    /api/translations/:id
DELETE /api/translations/:id
```

### Analytics

```text
GET /api/analytics
```

---

## Local Setup

### Prerequisites

Install:

- Node.js
- npm
- MongoDB
- Git

---

### 1. Clone the repository

```bash
git clone https://github.com/Bindu989/AI-Multilingual-Communication-Platform.git
cd AI-Multilingual-Communication-Platform
```

---

### 2. Install backend dependencies

```bash
cd backend
npm install
```

---

### 3. Install frontend dependencies

Open another terminal:

```bash
cd frontend
npm install
```

---

### 4. Configure environment variables

Create:

```text
backend/.env
```

Example configuration:

```env
MONGO_URI=mongodb://127.0.0.1:27017/mass_communication_db

JWT_SECRET=your_jwt_secret

RESEND_API_KEY=your_resend_api_key

DEEPL_API_KEY=your_deepl_api_key
```

> Never commit the real `.env` file to GitHub. The repository ignores `.env` files through `.gitignore`.

---

### 5. Start MongoDB

Make sure the MongoDB service is running locally.

The application uses:

```text
mongodb://127.0.0.1:27017/mass_communication_db
```

---

### 6. Start the backend

From `backend/`:

```bash
npm start
```

The backend runs on:

```text
http://localhost:5000
```

---

### 7. Start the frontend

From `frontend/`:

```bash
npm run dev
```

The Vite development server runs on the configured local port (for the current development setup, typically `5174` when `5173` is already occupied).

---

## Environment & Security

The project uses environment variables for secrets and configuration.

Sensitive values such as:

- API keys
- JWT secrets
- service credentials
- local database configuration

must remain outside source control.

The root `.gitignore` includes:

```gitignore
node_modules/
.env
.env.*
!.env.example
dist
dist-ssr
```

GitHub push protection is enabled for the repository, and secrets should never be bypassed or committed.

---

## Security Features

The backend includes:

- JWT authentication
- Password hashing with bcryptjs
- Protected routes
- Role-based authorization middleware
- Environment-variable based secret management
- Input validation for key entities
- Controlled message-status transitions
- Restricted destructive operations by user role

---

## Campaign Execution Flow

```text
User
  │
  ▼
Create Campaign
  │
  ▼
Select Audience
  │
  ▼
Choose Language + Channel
  │
  ├── Manual Run
  │      │
  │      ▼
  │   Execute Campaign
  │
  └── Scheduled Run
         │
         ▼
     node-cron Scheduler
         │
         ▼
     Execute Campaign
         │
         ▼
      Create Messages
         │
         ▼
     Send Supported Channel
         │
         ▼
   Update Message Status
         │
         ▼
   Mark Campaign Complete
```

---

## Translation Flow

```text
Source Message
      │
      ▼
Select Source Language
      │
      ▼
Select Target Language
      │
      ▼
Translation Service
      │
      ▼
DeepL API
      │
      ▼
Translated Text
      │
      ▼
Store Translation in MongoDB
```

---

## Database Entities

### User

Stores:

- name
- email
- password hash
- role

### Audience

Stores:

- demographic information
- language
- occupation
- engagement history
- recipients

### Campaign

Stores:

- campaign details
- target audience
- schedule
- channel
- status

### Message

Stores:

- campaign reference
- audience reference
- recipient
- channel
- language
- content
- delivery status
- timestamps
- error details

### Translation

Stores:

- source text
- source language
- target language
- translated result
- provider
- status
- timestamps

---

## Current Supported Delivery Channels

| Channel | Application Support | Live External Delivery |
|---|---|---|
| Email | ✅ | ✅ Resend |
| SMS | ✅ Model/UI support | ⚠️ Not enabled for campaign execution |
| WhatsApp | ✅ Model/UI support | ⚠️ Not enabled |
| Push | ✅ Model/UI support | ⚠️ Not enabled |

The project intentionally focuses on a working email delivery path rather than claiming complete integration for unsupported channels.

---

## Testing Highlights

During development, the following workflows were validated:

- User login and JWT-protected routes
- Role-based permission restrictions
- Audience creation and recipient management
- Campaign creation and editing
- Manual campaign execution
- Scheduled campaign execution
- Real email delivery
- Message creation and status updates
- Translation requests in supported languages
- Analytics aggregation
- GitHub secret protection and repository cleanup

---

## Known Limitations

1. **Kannada translation** depends on the capabilities of the selected translation provider and is currently not fully supported.
2. **Email** is the only channel with completed live campaign delivery integration.
3. SMS, WhatsApp, and push workflows are available at the application/model level but require additional provider integrations for production use.
4. Local development currently uses MongoDB on `127.0.0.1:27017`.

These limitations are documented explicitly to keep the project behavior transparent.

---

## Future Enhancements

Potential next-stage improvements include:

- Google/Microsoft OAuth
- Password reset and email verification
- Production-grade cloud deployment
- Broader translation-provider coverage
- Live SMS/WhatsApp/push integrations
- Message templates and personalization variables
- Bulk import/export of recipients
- Advanced audience segmentation
- Delivery webhooks for real-time status updates
- Scheduled recurring campaigns
- Audit logs
- Automated test suites
- Docker-based deployment
- CI/CD pipeline
- Cloud MongoDB deployment

---

## Project Outcome

The project demonstrates an end-to-end communication management workflow:

**Authenticate → Segment Audience → Create Campaign → Translate Content → Schedule/Execute → Deliver Messages → Track Status → Analyze Results**

It is designed as a practical foundation for multilingual organizational communication and can be extended into a production-grade communication platform.

---

## Repository

GitHub:

https://github.com/Bindu989/AI-Multilingual-Communication-Platform

---

## Author

**Bindu Chintagunta**

AI Multilingual Communication Platform
