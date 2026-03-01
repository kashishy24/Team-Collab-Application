# Team Collab – Real-Time Team Collaboration Platform

A full-stack team collaboration platform with **role-based access**, **Kanban task boards**, **real-time chat**, and an **AI assistant** for managing tasks in natural language.

---

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 19, Vite, Tailwind CSS, React Router, Firebase Auth, Socket.IO Client, @dnd-kit (drag & drop) |
| **Backend** | Node.js, Express, MongoDB (Mongoose), Socket.IO, Joi, Firebase Admin SDK |
| **Database** | MongoDB (MongoDB Atlas for production) |
| **Auth** | Firebase Authentication (email/password + Google) |
| **Deployment** | Frontend: Vercel / Netlify · Backend: Render / Railway · DB: MongoDB Atlas |

---

## Features

- **Authentication**: Sign up / Sign in with email or Google; role-based access (Admin, Manager, Member).
- **Teams**: Create a team on first login; team is required for all collaboration features.
- **Projects**: Create, edit, delete projects (Admin/Manager can create and edit; only Admin can delete).
- **Tasks (Kanban)**: Drag-and-drop boards (Todo → In progress → Done); create tasks per column; assign to team members.
- **Real-time Chat**: Socket.IO team chat; messages persisted and synced to all team members.
- **AI Assistant**: Natural language commands, e.g.:
  - “Create task [title]”
  - “List tasks”
  - “Assign task [title] to [email]”
  - “Mark task [title] as todo / in-progress / done”
- **Team Overview**: List members and roles; Admins can change member roles (Member / Manager / Admin).
- **UI**: Dark theme, responsive layout, Tailwind-based components.

---

## Project Structure

```
Team-Collab-Project1/
├── backend/                 # Express + MongoDB + Socket.IO API
│   ├── src/
│   │   ├── models/          # User, Team, Project, Task, Message
│   │   ├── routes/          # auth, projects, tasks, messages, assistant
│   │   ├── middleware/      # auth (Firebase), roles, validate (Joi)
│   │   ├── validators/      # Joi schemas
│   │   └── server.js        # App entry + Socket.IO
│   ├── .env.example
│   └── package.json
├── teamcollab/              # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/        # AuthContext
│   │   ├── layout/
│   │   ├── lib/             # firebase, api, socket
│   │   └── pages/           # Dashboard, Projects, Kanban, Team, Chat, Assistant, Login, SetupTeam
│   ├── .env.example
│   └── package.json
└── README.md                # This file
```

---

## Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- Firebase project (for Auth)

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env:
# - MONGODB_URI (e.g. mongodb://localhost:27017/teamcollab or Atlas URI)
# - CLIENT_ORIGIN (e.g. http://localhost:5173 for dev)
# - Firebase: set GOOGLE_APPLICATION_CREDENTIALS to path of service account JSON,
#   OR set FIREBASE_SERVICE_ACCOUNT to the JSON string (for serverless)

npm install
npm run dev
```

Server runs at `http://localhost:5000`. Health check: `GET /health`.

### 2. Frontend

```bash
cd teamcollab
cp .env.example .env
# Edit .env with your Firebase config (VITE_FIREBASE_*).
# For local dev with Vite proxy, leave VITE_API_URL empty.
# For production, set VITE_API_URL to your backend URL (e.g. https://your-api.onrender.com).

npm install
npm run dev
```

App runs at `http://localhost:5173`. Vite proxies `/api` and `/socket.io` to the backend.

### 3. Firebase

1. Create a project at [Firebase Console](https://console.firebase.google.com).
2. Enable **Authentication** → Email/Password and Google.
3. Get Web config (Project Settings → General) and put values into frontend `.env` (VITE_FIREBASE_*).
4. For backend token verification: Project Settings → Service accounts → Generate new private key. Save the JSON and set `GOOGLE_APPLICATION_CREDENTIALS` to its path (or use `FIREBASE_SERVICE_ACCOUNT` with the JSON string in production).

### 4. First Run

1. Open the app, sign up or sign in.
2. Create a team (name + optional description). You become Admin.
3. Create a project, open Kanban, add tasks, use Chat and Assistant as needed.

---

## API Endpoints (overview)

- **Auth / User**: `GET /api/auth/me`, `PUT /api/auth/me`, `POST /api/auth/teams`, `GET /api/auth/teams/members`, `PATCH /api/auth/teams/members/:userId/role`
- **Projects**: `GET /api/projects`, `POST /api/projects`, `PUT /api/projects/:id`, `DELETE /api/projects/:id` (role-protected)
- **Tasks**: `GET /api/tasks?projectId=`, `POST /api/tasks`, `PUT /api/tasks/:id`, `DELETE /api/tasks/:id`
- **Messages**: `GET /api/messages?teamId=`, `POST /api/messages`
- **Assistant**: `POST /api/assistant` body: `{ command, projectId? }`

All API requests (except health) require header: `Authorization: Bearer <Firebase ID token>`.

---

## Deployment

### Frontend (Vercel / Netlify)

- Build command: `npm run build`
- Output directory: `dist`
- Set env vars: all `VITE_*` from `.env`, especially `VITE_API_URL` and Firebase keys.

### Backend (Render / Railway)

- Start command: `npm start` (from `backend` folder).
- Env: `MONGODB_URI`, `CLIENT_ORIGIN` (your frontend URL), Firebase credentials.
- Expose port (e.g. 5000). Render/Railway will set `PORT`.

### MongoDB Atlas

- Create cluster, get connection string, add to `MONGODB_URI`.
- Allow network access for your backend IP / 0.0.0.0 if needed.

### After deploy

- Set frontend `VITE_API_URL` to the live backend URL.
- Set backend `CLIENT_ORIGIN` to the live frontend URL so CORS and Socket.IO work.

---

## Usability / Demo Video

Recommended flow to showcase:

1. **Login** – Email or Google.
2. **Create team** (if first time).
3. **Project & task management** – Create project, open Kanban, add tasks, drag between columns.
4. **Assistant** – “Create task X”, “List tasks”, “Mark task X as done”.
5. **Chat** – Send messages; open in another browser/tab to show real-time.
6. **Role-based views** – As Admin: delete project, change member roles; as Member: no delete, limited actions.

---

## License

MIT.
