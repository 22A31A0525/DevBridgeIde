Real-Time Collaborative Code Editor
Project Description
This is a full-stack, real-time collaborative code editor designed to enable multiple users to simultaneously write and edit code in a shared environment. Inspired by tools like Google Docs, this application provides instant synchronization of code changes, making it ideal for pair programming, online tutoring, technical interviews, and team-based development.

Features
Real-time Code Synchronization: Instant, character-by-character updates across all connected clients.

Multi-Cursor Support: See where other collaborators are typing in real-time.

Integrated Compiler (Planned/Future): Future enhancements to include an in-editor compiler for immediate code execution and output.

Live Chat: An integrated chat functionality for seamless communication among collaborators within the editor session.

Customizable Editor: Users can select different programming languages for syntax highlighting and choose from various themes for personalized comfort.

User Authentication & Authorization: Secure user registration and login system with JWT-based authentication.

Session Management: Create and join collaborative coding sessions.

Responsive UI: A modern and intuitive user interface built for optimal experience across different devices.

Technologies Used
This project leverages a robust stack to deliver its real-time collaborative capabilities:

Backend:

Spring Boot (Java): Framework for building robust, scalable, and secure API services.

Spring Security: For authentication and authorization, utilizing JSON Web Tokens (JWT).

Spring Data JPA: For database interaction and object-relational mapping.

Spring WebSocket: For handling real-time, bidirectional communication between clients and the server.

PostgreSQL: Relational database for storing user, session, and code data.

Lombok: Reduces boilerplate code for Java classes.

Maven: Build automation tool for the Java project.

Frontend:

React: JavaScript library for building the user interface.

Vite: Fast build tool for React development.

Tailwind CSS: Utility-first CSS framework for rapid and responsive UI development.

Axios: Promise-based HTTP client for making API requests.

Framer Motion: Library for declarative animations.

React Router DOM: For client-side routing.

WebSockets API: Browser API for real-time communication.

Database:

Supabase PostgreSQL: Managed PostgreSQL database solution providing the backend data store. Utilizes Supabase's Pooler for reliable cloud connectivity.

Orchestration/Development Environment:

Replit: Used as the primary development environment for its integrated full-stack capabilities (for local testing).

ConcurrentlY: NPM package to run backend and frontend simultaneously in development.

NPM / Node.js: Package manager and runtime for the frontend.

Getting Started (Local Development)
To get a copy of this project up and running on your local machine for development and testing purposes, follow these steps.

Prerequisites
Java Development Kit (JDK) 17 or 21 (matching your backend/pom.xml and replit.nix)

Maven 3.x

Node.js (LTS recommended) and npm

Git

1. Clone the Repository
First, clone this GitHub repository to your local machine:

git clone https://github.com/[Your-GitHub-Username]/[Your-Repo-Name].git
cd [Your-Repo-Name]

2. Backend Setup (Spring Boot)
Navigate into the backend directory.

cd backend

application.properties Configuration
Create or update the src/main/resources/application.properties file with your Supabase PostgreSQL database connection details. Ensure you are using the Supabase Pooler URL and your actual credentials.

backend/src/main/resources/application.properties:

# Supabase Pooler Connection String
spring.datasource.url=jdbc:postgresql://aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require&options=-c%20password_encryption%3Dmd5
spring.datasource.username=postgres.apbkobhfnmcqqzqeeqss # Use your actual Supabase Pooler username
spring.datasource.password=YOUR_ACTUAL_SUPABASE_PASSWORD # Replace with your actual Supabase database password

spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.hibernate.ddl-auto=update # Auto-updates schema based on entities (good for development)
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

server.port=8080 # Spring Boot backend will run on this port

Important: Replace YOUR_ACTUAL_SUPABASE_PASSWORD with your real password.

Build the Backend
Build the Spring Boot application using Maven. This will generate an executable JAR file.

mvn clean install -DskipTests # -DskipTests skips running tests during build

3. Frontend Setup (React/Vite)
Navigate into the frontend directory.

cd ../frontend

Install Dependencies
Install the necessary Node.js packages:

npm install --immutable

Environment Variables (.env.development)
Create a .env.development file in the frontend/ directory for local development environment variables. This will tell your React app where to find the local backend.

frontend/.env.development:

VITE_APP_BACKEND_URL=http://localhost:8080
VITE_APP_BACKEND_WEBSOCKET_URL=ws://localhost:8080




4. Running the Project Locally (Full Stack)
Navigate back to the root directory of your project (the monorepo root where the main package.json is located).

cd .. # If you're in frontend/

This project uses a root package.json to orchestrate both frontend and backend development.

package.json (at the project root):

{
  "name": "realtime-code-editor-monorepo",
  "version": "1.0.0",
  "description": "Orchestrates Spring Boot Backend and React/Vite Frontend for collaborative editor",
  "main": "index.js",
  "scripts": {
    "start-backend": "cd backend && mvn spring-boot:run",
    "build-frontend": "cd frontend && npm install --immutable && npm run build",
    "serve-frontend": "cd frontend && npx serve -s dist -l 3000",
    "start-all": "npm run build-frontend && concurrently \"npm run start-backend\" \"npm run serve-frontend\""
  },
  "keywords": ["realtime", "code-editor", "spring-boot", "react", "websocket", "supabase"],
  "author": "Your Name/Team",
  "license": "ISC",
  "devDependencies": {
    "concurrently": "^8.2.0",
    "serve": "^14.2.1"
  }
}

Now, run the full stack:

npm install # Install root-level dependencies (like concurrently, serve)
npm run start-all

This command will:

Build your React frontend.

Start your Spring Boot backend on http://localhost:8080.

Serve your built React frontend on http://localhost:3000.

Open your browser to http://localhost:3000 to access the application.

Deployment (Azure Cloud)
This project is designed for deployment on Microsoft Azure, leveraging Azure App Service for the Spring Boot backend and Azure Static Web Apps for the React frontend, while connecting to your external Supabase PostgreSQL database.

Backend Deployment (Azure App Service)
Service: Azure App Service (for Java applications).

Source: Deploys from your GitHub repository (configured via Deployment Center in Azure Portal).

Configuration: Environment variables (SPRING_DATASOURCE_URL, SPRING_DATASOURCE_USERNAME, SPRING_DATASOURCE_PASSWORD, SERVER_PORT) are set as Application Settings in Azure Portal for security.

CORS: Configured on the App Service to allow requests from your Azure Static Web App frontend.


Source: Deploys directly from your GitHub repository (configured during SWA creation).

API Integration: The Static Web App is linked to your Azure App Service backend (via the "APIs" section in SWA settings), typically routing requests from /api paths to your backend.

Environment Variables: Frontend uses .env.production (committed to GitHub) to pick up the deployed backend URL.

Database (Supabase PostgreSQL)
The application continues to use your existing Supabase PostgreSQL database.

Crucially, the Azure App Service connects to Supabase using the Pooler Connection String (aws-0-ap-south-1.pooler.supabase.com) to ensure compatibility and reliability from cloud environments.

For detailed deployment instructions to Azure, refer to the step-by-step guide provided separately.

Usage
Register/Login: Create a new user account or log in with existing credentials.

Create/Join Session: Once logged in, you can create a new collaborative coding session or join an existing one using its unique session ID.

Collaborate: Start typing! Your changes will be reflected in real-time for all other users in the same session. Utilize the built-in chat for communication.

Contributing
Contributions are welcome! If you'd like to contribute, please follow these steps:

Fork the repository.

Create a new branch for your feature (git checkout -b feature/AmazingFeature).

Commit your changes (git commit -m 'Add some AmazingFeature').

Push to the branch (git push origin feature/AmazingFeature).

Open a Pull Request.
