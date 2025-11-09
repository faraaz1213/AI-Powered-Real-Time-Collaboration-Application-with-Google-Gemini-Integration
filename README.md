CodeGenie Chat is an AI-powered real-time chat application built using the MERN stack with Socket.IO for instant messaging and Google Gemini AI integration.
It allows multiple users to collaborate inside project-based chat rooms, share ideas in real-time, and even interact with an AI assistant directly within the chat.
The system is designed to be secure, fast, and scalable, supporting JWT-based authentication, Redis session management, and intelligent AI responses.
⚙️ Tech Stack
Layer	Technology
Frontend	React.js (Vite), TailwindCSS, Framer Motion, Socket.IO Client
Backend	Node.js, Express.js, Socket.IO, Mongoose
Database	MongoDB Atlas
Cache / Session Store	Redis
AI Integration	Google Gemini API (@google/generative-ai)
Authentication	JWT (JSON Web Tokens)
Deployment Ready	Docker / Render / Vercel
🏗️ Architecture Diagram
Frontend (React + Tailwind)
|
|  REST API / WebSocket
v
Backend (Express + Socket.IO)
|
+-- MongoDB (Users, Projects, Messages)
|
+-- Redis (Token Blacklist)
|
+-- Google Gemini (AI Responses)
💡 Key Features
💬 Real-Time Chat — Built using Socket.IO, supports 50+ concurrent users with sub-200ms latency.
🤖 AI Assistant (Google Gemini) — Users can type @ai followed by a message to get intelligent, context-aware responses.
🧑‍🤝‍🧑 Multi-Project Collaboration — Users can create multiple projects and add teammates to separate chat rooms.
🔐 Secure Authentication — Implemented JWT-based auth and Redis token blacklisting for safe login/logout.
📱 Responsive Dark-Themed UI — Built using React, TailwindCSS, and Framer Motion for smooth animations.
⚙️ Scalable Architecture — Modular design with separate controllers, models, and services.
⚡ Optimized Backend — Asynchronous processing with <200ms message delivery even under load.
🧩 Typing Indicators & Online Status — Shows real-time user presence and typing activity.
🗂️ Folder Structure
CodeGenie-Chat/
│
├── backend/
│   ├── controllers/
│   │   ├── user.controller.js
│   │   ├── project.controller.js
│   │   └── ai.controller.js
│   ├── middleware/
│   │   └── auth.middleware.js
│   ├── models/
│   │   ├── user.model.js
│   │   └── project.model.js
│   ├── routes/
│   │   ├── user.routes.js
│   │   ├── project.routes.js
│   │   └── ai.routes.js
│   ├── services/
│   │   ├── redis.service.js
│   │   ├── ai.service.js
│   │   └── project.service.js
│   ├── app.js
│   ├── server.js
│   └── db.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Home.jsx
│   │   │   └── Project.jsx
│   │   ├── context/
│   │   │   └── user.context.jsx
│   │   ├── utils/
│   │   │   ├── axios.js
│   │   │   └── socket.js
│   │   └── AppRoutes.jsx
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
│   └── vite.config.js
│
└── README.md
⚡ Setup Instructions
🔧 Backend Setup
Clone the repository:
git clone https://github.com/yourusername/CodeGenie-Chat.git
cd CodeGenie-Chat/backend

Install dependencies:
npm install

Create .env file:
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_PASSWORD=your_redis_password
GOOGLE_API_KEY=your_google_gemini_api_key
PORT=3000

Run backend:
npm start

Server runs on: http://localhost:3000
Frontend Setup
Go to frontend folder:
cd ../frontend

Install dependencies:
npm install

Create .env file:
VITE_API_URL=http://localhost:3000

Run frontend:
npm run dev

Frontend runs on: http://localhost:5173
API Endpoints Overview
Endpoint	Method	Description
/users/register	POST	Register a new user
/users/login	POST	Login and get JWT
/users/logout	POST	Logout and blacklist token
/projects/create	POST	Create a new project
/projects/add-user	PUT	Add users to project
/projects/all	GET	Get all projects of a user
/ai/get-result	GET	Get Gemini AI response
How the AI Feature Works
User types a message containing @ai.
Backend extracts the prompt and sends it to Google Gemini API using @google/generative-ai.
The AI response is returned and broadcast to all users in the same project room.
🔒 Security Implementations
Passwords hashed with bcrypt
JWT used for authentication
Redis used for token invalidation
CORS restricted to frontend origin
Environment secrets stored in .env
🧩 Future Enhancements
🔔 Push notifications
📎 File & image sharing in chat
🕵️ Role-based access (Admin / Member)
📊 Analytics for AI interactions
☁️ Dockerized deployment with CI/CD

🧾 License
This project is licensed under the MIT License — feel free to use and modify.
