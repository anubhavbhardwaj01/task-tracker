# TeamFlow - Team Task Manager

Full-stack web application for team project and task management.

## Overview

TeamFlow is a production-ready task management app where:

- **Admins** manage projects, assign tasks, and monitor team progress.
- **Members** view and update their assigned tasks.

## Tech Stack

### Frontend

- React 18 (Hooks, Context API, React Router v6)
- Custom CSS (design system with CSS variables)
- Axios (API calls)
- date-fns (date formatting)

### Backend

- Node.js + Express
- JWT authentication (`jsonwebtoken`)
- Password hashing (`bcryptjs`)
- Mongoose + MongoDB Atlas
- Role-based middleware (`ADMIN` / `MEMBER`)

### Deployment

- Railway (backend + frontend as separate services)
- MongoDB Atlas (cloud database)

## Features

### Admin Can

- Create, edit, and delete projects
- Add or remove team members from projects
- Create, assign, edit, and delete tasks
- View all tasks across all projects
- Filter tasks by status, project, or member
- View all registered users
- See dashboard stats (total/completed/pending/overdue)

### Member Can

- View projects they are assigned to
- View their own tasks
- Update task status (`Todo -> In-Progress -> Done`)
- See personal dashboard stats

## Sample Credentials

### Admin Account

- Email: `admin@teamflow.com`
- Password: `admin123`

### Member Account

- Email: `member@teamflow.com`
- Password: `member123`

> These are seeded via signup. Create the admin account first from `/signup` by selecting **Admin**, then create a member account.

## Local Setup Instructions

### Prerequisites

- Node.js v18+
- npm v8+
- MongoDB Atlas account (free tier is fine)

### 1) Clone the project

```bash
git clone <your-repo-url>
cd team-task-manager
```

### 2) Set up backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

```env
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/task-manager
JWT_SECRET=any_long_random_string
PORT=5000
FRONTEND_URL=http://localhost:3000
```

Run backend:

```bash
npm run dev
```

Backend runs at `http://localhost:5000`.

### 3) Set up frontend

Open a new terminal:

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Run frontend:

```bash
npm start
```

Frontend runs at `http://localhost:3000`.

### 4) Create first admin user

- Open `http://localhost:3000/signup`
- Fill in name, email, password
- Select role: **Admin**
- Sign up

## API Routes Reference

### Auth

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login, returns JWT
- `GET /api/auth/me` - Get current user (protected)

### Users (Admin only)

- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID
- `DELETE /api/users/:id` - Remove user

### Projects

- `GET /api/projects` - List projects (admin = all, member = own)
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project (admin)
- `PUT /api/projects/:id` - Update project + members (admin)
- `DELETE /api/projects/:id` - Delete project + tasks (admin)

### Tasks

- `GET /api/tasks` - List tasks (filter by status/project/assignedTo)
- `GET /api/tasks/dashboard` - Dashboard stats
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create task (admin)
- `PUT /api/tasks/:id` - Update task (admin = full, member = status only)
- `DELETE /api/tasks/:id` - Delete task (admin)

## Railway Deployment Guide

### Prerequisites

- GitHub account
- Railway account ([railway.app](https://railway.app))
- MongoDB Atlas cluster (free tier)

### 1) Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<you>/team-task-manager.git
git push -u origin main
```

### 2) Set up MongoDB Atlas

1. Go to `cloud.mongodb.com` and create a free cluster.
2. Create a database user (username + password).
3. Allow all IPs: **Network Access -> Add IP -> `0.0.0.0/0`**.
4. Copy the connection string from **Clusters -> Connect -> Drivers**.

Format:

```text
mongodb+srv://<user>:<pass>@cluster.mongodb.net/task-manager
```

### 3) Deploy backend to Railway

1. Go to Railway -> **New Project -> Deploy from GitHub repo**
2. Select your repo and choose the **backend** service
3. In service settings, set **Root Directory** to `/backend`
4. Add environment variables:

```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_key_min_32_chars
JWT_EXPIRES=7d
PORT=5000
FRONTEND_URL=(set after frontend is deployed)
```

5. Deploy and copy generated URL (e.g. `https://api-xxx.railway.app`)

### 4) Deploy frontend to Railway

1. In the same Railway project, add a new service from the same GitHub repo
2. Set **Root Directory** to `/frontend`
3. Add environment variable:

```env
REACT_APP_API_URL=https://api-xxx.railway.app/api
```

4. Deploy and copy generated URL (e.g. `https://app-xxx.railway.app`)

### 5) Update CORS

1. Go back to backend service environment variables
2. Update:

```env
FRONTEND_URL=https://app-xxx.railway.app
```

3. Redeploy backend

### 6) Test live app

- Open `https://app-xxx.railway.app`
- Sign up as admin and create projects/tasks

## Live URL

- Backend: `https://YOUR-BACKEND-URL.railway.app`
- Frontend: `https://YOUR-FRONTEND-URL.railway.app`

Replace placeholders after deployment.

## Demo Video Recording Guide (2-5 minutes)

Recommended flow:

- `0:00` Open live app URL, show login page
- `0:15` Log in as admin (`admin@teamflow.com / admin123`)
- `0:30` Show dashboard (stat cards, recent tasks)
- `0:50` Navigate to Projects page
- `1:00` Create project, assign members
- `1:20` Navigate to Tasks page
- `1:30` Create task and show it appears
- `1:50` Edit task (assignee + due date)
- `2:05` Filter by status `In-Progress`
- `2:20` Show Team Members page
- `2:35` Logout, then login as member (`member@teamflow.com / member123`)
- `2:50` Show member dashboard
- `3:05` Update a task status
- `3:20` Change status to `Done`, show updated badge
- `3:35` Show member cannot create tasks (no "New Task" button)
- `3:45` Wrap up and show live URL

### Recording Tools

- OBS Studio (free, cross-platform)
- Loom (browser extension)
- QuickTime (macOS)

## Folder Structure

```text
team-task-manager/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── projects.js
│   │   └── tasks.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── railway.toml
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── components/
    │   │   └── Layout.js
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Signup.js
    │   │   ├── Dashboard.js
    │   │   ├── Projects.js
    │   │   ├── Tasks.js
    │   │   └── Users.js
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    ├── package.json
    ├── .env.example
    └── railway.toml
```
