====================================================
  TEAMFLOW — Team Task Manager
  Full-Stack Web Application
====================================================

OVERVIEW
--------
TeamFlow is a production-ready team task management application that allows
administrators to manage projects, assign tasks, and track team progress,
while team members can view and update their own assigned tasks.

TECH STACK
----------
Frontend:
  - React 18 (hooks, context API, React Router v6)
  - Custom CSS (design system with CSS variables)
  - Axios for API calls
  - date-fns for date formatting

Backend:
  - Node.js + Express
  - JWT authentication (jsonwebtoken)
  - bcryptjs for password hashing
  - Mongoose + MongoDB Atlas
  - Role-based middleware (ADMIN / MEMBER)

Deployment:
  - Railway (backend + frontend as separate services)
  - MongoDB Atlas (cloud database)

====================================================
FEATURES
====================================================

ADMIN CAN:
  ✅ Create, edit, delete projects
  ✅ Add/remove team members from projects
  ✅ Create, assign, edit, delete tasks
  ✅ View all tasks across all projects
  ✅ Filter tasks by status, project, or member
  ✅ View all registered users
  ✅ See dashboard with stats (total/completed/pending/overdue)

MEMBER CAN:
  ✅ View projects they're assigned to
  ✅ View their own tasks
  ✅ Update task status (Todo → In-Progress → Done)
  ✅ See personal dashboard with their task stats

====================================================
SAMPLE CREDENTIALS
====================================================

Admin Account:
  Email:    admin@teamflow.com
  Password: admin123

Member Account:
  Email:    member@teamflow.com
  Password: member123

NOTE: These are seeded via signup. Create the admin account first from
      /signup selecting "Admin" role, then create a member account.

====================================================
LOCAL SETUP INSTRUCTIONS
====================================================

PREREQUISITES:
  - Node.js v18+ installed
  - npm v8+ installed
  - MongoDB Atlas account (free tier works)

STEP 1: Clone / Download the project
  git clone <your-repo-url>
  cd team-task-manager

STEP 2: Set up Backend
  cd backend
  npm install
  cp .env.example .env
  # Edit .env and fill in:
  #   MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/task-manager
  #   JWT_SECRET=any_long_random_string
  #   PORT=5000
  #   FRONTEND_URL=http://localhost:3000
  npm run dev        # Starts backend on http://localhost:5000

STEP 3: Set up Frontend
  # Open a new terminal
  cd frontend
  npm install
  cp .env.example .env
  # Edit .env:
  #   REACT_APP_API_URL=http://localhost:5000/api
  npm start          # Starts frontend on http://localhost:3000

STEP 4: Create first admin user
  - Open http://localhost:3000/signup
  - Fill in name, email, password
  - Select Role: Admin
  - Sign up

====================================================
API ROUTES REFERENCE
====================================================

AUTH
  POST   /api/auth/signup    Register new user
  POST   /api/auth/login     Login, returns JWT
  GET    /api/auth/me        Get current user (protected)

USERS (Admin only)
  GET    /api/users          List all users
  GET    /api/users/:id      Get user by ID
  DELETE /api/users/:id      Remove user

PROJECTS
  GET    /api/projects       List projects (admin=all, member=own)
  GET    /api/projects/:id   Get single project
  POST   /api/projects       Create project (admin)
  PUT    /api/projects/:id   Update project + members (admin)
  DELETE /api/projects/:id   Delete project + tasks (admin)

TASKS
  GET    /api/tasks          List tasks (filterable by status/project/assignedTo)
  GET    /api/tasks/dashboard Dashboard stats
  GET    /api/tasks/:id      Get single task
  POST   /api/tasks          Create task (admin)
  PUT    /api/tasks/:id      Update task (admin=full, member=status only)
  DELETE /api/tasks/:id      Delete task (admin)

====================================================
RAILWAY DEPLOYMENT GUIDE
====================================================

PREREQUISITES:
  - GitHub account
  - Railway account (railway.app — free tier available)
  - MongoDB Atlas cluster (free tier)

STEP 1: Push to GitHub
  git init
  git add .
  git commit -m "Initial commit"
  git remote add origin https://github.com/<you>/team-task-manager.git
  git push -u origin main

STEP 2: Set up MongoDB Atlas
  1. Go to cloud.mongodb.com → Create free cluster
  2. Create database user (username + password)
  3. Allow all IPs: Network Access → Add IP → 0.0.0.0/0
  4. Get connection string: Clusters → Connect → Drivers
     Format: mongodb+srv://<user>:<pass>@cluster.mongodb.net/task-manager

STEP 3: Deploy Backend to Railway
  1. Go to railway.app → New Project → Deploy from GitHub repo
  2. Select your repo → Choose the BACKEND service
  3. In Service Settings → Root Directory: /backend
  4. Add environment variables:
     MONGO_URI        = mongodb+srv://...
     JWT_SECRET       = your_secret_key_min_32_chars
     JWT_EXPIRES      = 7d
     PORT             = 5000
     FRONTEND_URL     = (set after frontend is deployed)
  5. Deploy → Copy the generated URL (e.g. https://api-xxx.railway.app)

STEP 4: Deploy Frontend to Railway
  1. In the same Railway project → Add Service → GitHub Repo
  2. Select same repo → Root Directory: /frontend
  3. Add environment variables:
     REACT_APP_API_URL = https://api-xxx.railway.app/api
  4. Deploy → Copy the generated URL (e.g. https://app-xxx.railway.app)

STEP 5: Update CORS
  1. Go back to Backend service environment variables
  2. Update FRONTEND_URL = https://app-xxx.railway.app
  3. Redeploy backend

STEP 6: Test live app
  - Open https://app-xxx.railway.app
  - Sign up as admin, then create projects & tasks

====================================================
LIVE URL
====================================================

Backend:  https://YOUR-BACKEND-URL.railway.app
Frontend: https://YOUR-FRONTEND-URL.railway.app

(Replace placeholders after deployment)

====================================================
DEMO VIDEO RECORDING GUIDE (2–5 minutes)
====================================================

Recommended flow for demo video:

0:00 — Open the live app URL, show login page
0:15 — Log in as ADMIN (admin@teamflow.com / admin123)
0:30 — Show Dashboard: stat cards, recent tasks
0:50 — Navigate to Projects page
1:00 — Create a new project, assign members
1:20 — Navigate to Tasks page
1:30 — Create a new task (fill all fields), show it appears
1:50 — Edit a task, change assignee and due date
2:05 — Show filter: filter by status "In-Progress"
2:20 — Navigate to Team Members page, show user list
2:35 — Logout → login as MEMBER (member@teamflow.com / member123)
2:50 — Show Member Dashboard (limited to own tasks)
3:05 — Go to Tasks, click "Update Status" on a task
3:20 — Change status to "Done", show badge updates
3:35 — Show that Member cannot create tasks (no "New Task" button)
3:45 — Wrap up and show the live URL

TOOLS:
  - OBS Studio (free, cross-platform) for screen recording
  - Loom (browser extension, easy sharing)
  - QuickTime (macOS)

====================================================
FOLDER STRUCTURE
====================================================

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

====================================================
