# CodeSync: Real-Time Collaborative Code Editor

![Java](https://img.shields.io/badge/java-%23ED8B00.svg?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring](https://img.shields.io/badge/spring-%236DB33F.svg?style=for-the-badge&logo=spring&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232A.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Render](https://img.shields.io/badge/Render-%2346E3B7.svg?style=for-the-badge&logo=render&logoColor=white)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)

CodeSync is a web-based, real-time collaborative code editor that allows multiple developers to join a session and write, edit, and review code together simultaneously. This full-stack application is built with a robust Java Spring Boot backend and a dynamic React frontend.

## Features

-   **Real-Time Collaborative Editing:** Multiple users can type in the same editor, with changes reflected on everyone's screen instantly using a delta-queue synchronization system.
-   **Multi-Language Support:** Syntax highlighting for various languages including Java, JavaScript, Python, and C++.
-   **Session Management:** Users can create unique, shareable sessions.
-   **Live Presence:** A list of currently active users is displayed for each session.
-   **Integrated Chat:** A real-time chat panel allows users in a session to communicate.
-   **Authentication:** Secure user registration and login using JWT (JSON Web Tokens).
-   **Code Execution:** Run code written in the editor and see the output directly in the application.

## Tech Stack

### Frontend
-   **React.js:** For building the component-based user interface.
-   **Monaco Editor:** The editor engine that powers VS Code for a rich editing experience.
-   **StompJS & SockJS:** For WebSocket communication.
-   **Tailwind CSS:** For styling the user interface.
-   **Vite:** Fast build tool and development server.

### Backend
-   **Java 17 & Spring Boot:** For the core application and REST APIs.
-   **Spring Security & JWT:** For securing the application and handling authentication.
-   **Spring WebSocket:** For handling real-time, bi-directional communication.
-   **PostgreSQL:** As the primary database for user and session data.

### Deployment
-   **Backend:** Deployed on **Render** (Cloud Application Hosting).
-   **Frontend:** Deployed on **Vercel** (Frontend Cloud Platform).

## Deployment Guide

This application follows a modern multi-cloud deployment strategy.

### 1. Backend Deployment (Render)
The backend is a Dockerized Spring Boot application.
1.  **Platform:** Create a new "Web Service" on [Render](https://render.com).
2.  **Environment Variables:**
    -   `DB_URL`: JDBC URL for your PostgreSQL database (e.g., from Neon or Render PostgreSQL).
    -   `DB_USERNAME` & `DB_PASSWORD`: Database credentials.
    -   `JWT_SECRET_KEY`: Secure random string for token signing.
    -   `JWT_EXPIRATION`: Token validity duration in milliseconds.
    -   `CORS_ALLOWED_ORIGINS`: Comma-separated list of allowed frontend origins (e.g., `https://your-app.vercel.app`).
3.  **Docker:** Render automatically builds the application using the `Dockerfile` located in `backend/RealTime-CodeSync`.

### 2. Frontend Deployment (Vercel)
The frontend is a Vite + React application optimized for Vercel.
1.  **Platform:** Import the repository into [Vercel](https://vercel.com).
2.  **Root Directory:** Set the root directory to `frontend/realtime-collabrative-editor`.
3.  **Environment Variables:**
    -   `VITE_APP_BACKEND_URL`: The URL of your deployed backend (e.g., `https://api.render.com`).
    -   `VITE_APP_BACKEND_WEBSOCKET_URL`: The domain of your backend (e.g., `api.render.com`) for WebSocket connections.
4.  **Routing:** A `vercel.json` file is included to handle Single Page Application (SPA) routing, ensuring pages like `/login` work correctly on refresh.

## Future Improvements
-   **Persistence with Redis:** Move the in-memory session storage to Redis to ensure session data persists across server restarts and to enable scaling.
-   **Live Cursor Tracking:** Implement real-time cursor position and selection sharing.
-   **Advanced Concurrency Control:** Research Operational Transformation (OT) or CRDTs to flawlessly handle simultaneous edits.
