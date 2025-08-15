# CodeSync: Real-Time Collaborative Code Editor

![Java](https://img.shields.io/badge/java-%23ED8B00.svg?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring](https://img.shields.io/badge/spring-%236DB33F.svg?style=for-the-badge&logo=spring&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232A.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Nginx](https://img.shields.io/badge/nginx-%23009639.svg?style=for-the-badge&logo=nginx&logoColor=white)
![GCP](https://img.shields.io/badge/Google_Cloud-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)

CodeSync is a web-based, real-time collaborative code editor that allows multiple developers to join a session and write, edit, and review code together simultaneously. This full-stack application is built with a robust Java Spring Boot backend and a dynamic React frontend, fully deployed on Google Cloud Platform.

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

### Backend
-   **Java 17 & Spring Boot:** For the core application and REST APIs.
-   **Spring Security & JWT:** For securing the application and handling authentication.
-   **Spring WebSocket:** For handling real-time, bi-directional communication.
-   **PostgreSQL:** As the primary database for user and session data.
-   **In-Memory State:** `ConcurrentHashMap` for managing active users and sessions.

### Deployment
-   **Google Cloud Platform (GCP)**
-   **Google Compute Engine (GCE):** For hosting the application on a Linux VM.
-   **Nginx:** As a reverse proxy and for serving the static frontend files.

## Deployment Guide (GCP)

This application is deployed on a Google Compute Engine VM. Here is a summary of the process:

### 1. Backend Deployment
1.  **Package the Application:** The Java Spring Boot application is packaged into an executable `.jar` file using `mvn clean package`.
2.  **Copy to Server:** The `.jar` file is copied to the GCE VM using `gcloud compute scp`.
3.  **Run the Service:** The application is started on the VM as a background process using `nohup java -jar your-app.jar &`. It connects to the locally installed PostgreSQL database and listens on port `8080`.

### 2. Frontend Deployment
1.  **Build the Application:** The React application is built for production using `npm run build`, creating an optimized `build` folder.
2.  **Copy to Server:** The `build` folder is recursively copied to the GCE VM using `gcloud compute scp --recurse`.

### 3. Nginx Configuration
Nginx is installed on the VM and configured as a reverse proxy.
-   It listens on the public port `80`.
-   It serves the static files from the React `build` folder for any page requests (e.g., `/`, `/auth/login`).
-   It forwards all API requests starting with `/api/` or `/auth/` to the backend running on `http://localhost:8080`.
-   It upgrades and forwards all WebSocket connections starting with `/ws/` to the backend.

### 4. Firewall Configuration
A firewall rule is created in Google Cloud to allow public internet traffic (`0.0.0.0/0`) on `TCP:80`, applied to the VM using a network tag.

## Future Improvements
-   **Persistence with Redis:** Move the in-memory session storage to Redis to ensure session data persists across server restarts and to enable scaling.
-   **Live Cursor Tracking:** Implement real-time cursor position and selection sharing.
-   **Advanced Concurrency Control:** Research Operational Transformation (OT) or CRDTs to flawlessly handle simultaneous edits.
