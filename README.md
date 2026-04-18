# Repl-Dashboard

Repl-Dashboard is a web-based dashboard application built with Next.js, designed to provide an administrative interface or a user-facing portal for managing various aspects of a Discord bot or other services. It leverages MongoDB for data persistence and `iron-session` for secure session management.

## Features

*   **Next.js Framework:** Modern React framework for server-side rendering and static site generation.
*   **MongoDB Integration:** Connects to a MongoDB database for data storage and retrieval.
*   **Secure Sessions:** Utilizes `iron-session` for robust and secure user session management.
*   **API Routes:** Provides API endpoints for interacting with the backend and database.

## Technologies Used

*   **Framework:** Next.js, React
*   **Language:** JavaScript
*   **Database:** MongoDB (via Mongoose)
*   **Session Management:** `iron-session`
*   **HTTP Client:** `axios`

## Project Structure

```
repl-dashboard/
├── lib/                    # Utility functions and helper modules
├── next.config.js          # Next.js configuration file
├── package.json            # Project dependencies and scripts
├── pages/                  # Next.js pages and API routes
│   ├── api/                # API routes for backend logic
│   └── _app.js             # Custom App component for Next.js
└── README.md               # Project documentation
```

## Setup Instructions

To set up and run Repl-Dashboard locally, follow these steps:

### 1. Prerequisites

*   **Node.js:** Ensure you have Node.js (LTS version recommended) installed.
*   **MongoDB:** A running MongoDB instance (local or cloud-hosted, e.g., MongoDB Atlas).

### 2. Clone the Repository

```bash
git clone https://github.com/imtealplayz/repl-dashboard.git
cd repl-dashboard
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory of the project and add your MongoDB connection string and a secret for `iron-session`:

```
MONGO_URI=YOUR_MONGODB_CONNECTION_STRING
SECRET_COOKIE_PASSWORD=YOUR_SECRET_COMPLEX_PASSWORD_AT_LEAST_32_CHARS
```

*Replace the placeholder values with your actual MongoDB connection string and a strong, random secret.*

### 5. Run the Development Server

```bash
npm run dev
```

### 6. Access the Dashboard

Open your web browser and visit `http://localhost:3000` to access the Repl-Dashboard.
