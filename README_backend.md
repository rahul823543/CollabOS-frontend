# CollabOS Backend API & Architecture Documentation

## Architecture & Structure

The CollabOS backend is built using a modern **Node.js + Express** stack, connected to a **MongoDB** database via Mongoose. The codebase strongly adheres to the MVC (Model-View-Controller) pattern, ensuring separation of concerns and maintainability.

### Folder Hierarchy

```
c:\Farzi\CollabOS_final\src\
├── config/        # Environment and DB connection configurations (e.g., db.js)
├── controllers/   # Request handling logic for each API resource
├── middleware/    # Custom Express middlewares (auth, error handling)
├── models/        # Mongoose database schemas
├── routes/        # Express route definitions pointing to controllers
├── services/      # Business logic and external service integrations (e.g., AI, GitHub)
├── socket/        # Socket.io setup (e.g., Online Tracker)
├── utils/         # Helper utilities (async handler, Gemini client setup)
└── server.js      # Main application entry point
```

### Data Flow

1. **Client Request:** Incoming requests hit the API endpoints defined in `server.js`.
2. **Middleware:** Requests pass through global middleware (helmet, cors, rate limiting) and route-specific middleware (like the `protect` auth middleware).
3. **Router:** The specific router (e.g., `Task.routes.js`) routes the request to the corresponding controller.
4. **Controller:** The controller extracts payload and params. For complex logic, it offloads work to the `services` layer.
5. **Service / Model:** The service layer handles logic like calling external APIs (Gemini, GitHub, Google Drive) or interacts directly with Mongoose Models to mutate the database.
6. **Response:** The controller returns a JSON response to the client or passes errors to the global error handler.

---

## API Documentation

Below is a summary of the key available routes. Base URL: `http://localhost:<PORT>`

### Auth (`/api/auth`)
Handles user authentication and JWT token generation.
- `POST /register`: Register a new user. Payload: `{ name, email, password }`
- `POST /login`: Authenticate a user. Payload: `{ email, password }`
- `GET /me`: Get current logged-in user profile. (Requires Auth)

### Teams (`/api/team`)
- `POST /`: Create a team. Payload: `{ name }`
- `GET /`: Get user's teams.
- `PUT /:id/members`: Add a member to a team. Payload: `{ email }`

### Projects (`/api/projects`)
- `POST /`: Create a new project. Payload: `{ teamId, title, description, deadline }`
- `GET /`: Get user's projects.
- `GET /:id`: Get project details.

### Tasks (`/api/tasks`)
- `POST /`: Create and automatically distribute tasks. Payload: `{ projectId, tasks: [{ title, type }], overrides: [] }`
- `GET /`: Get tasks. Query params: `?projectId=...&assignedTo=...`
- `PUT /:id`: Update task status. Payload: `{ status, proof }`. (Proof is required if status is "done").
- `DELETE /:id`: Delete a task.

### Skills (`/api/skills`)
- `PUT /users/skills`: Update a user's skills. Payload: `{ skills: ["React", "Node.js"] }`
- `GET /teams/:teamId/members`: Get team members along with their populated skills.

### AI Task Generation (`/api/ai`)
- `POST /generate-tasks`: Get task breakdown suggestions. Payload: `{ projectTitle, description, techStack }`

### Integrations (`/api/integrations`)
- `/github/...` : GitHub repository and commit integration routes.
- `/google/...` : Google Drive folder integration and auth callbacks.

---

## Database Models

- **User**: Stores user details (`name`, `email`, `password`), `role`, and critically, an array of `skills`.
- **Team**: Maps users to a team (`name`, `members` array, `createdBy`).
- **Project**: Links to a `Team` and tracks project `status`, `deadline`, and `description`.
- **Task**: Highly detailed schema tracking assignment (`assignedTo`), task `type`, `deadline`, `status`. It also incorporates advanced metrics like `weightAssigned`, `weightEarned`, `qualityFactor`, `timeFactor`, and `userPerformance`. Contains fields for code work (`commitId`) and document work (`googleDriveFileId`).
- **Contribution**: Audit trail of completed tasks and commits. Tracks user performance metrics historically (`weightAssigned`, `weightEarned`, `qualityFactor`, `timeFactor`).
- **Integration & GoogleIntegration**: Stores OAuth access tokens and metadata for GitHub and Google Drive connections.

---

## Feature Audit: Skill-Based Task Assignment

**Status:** ✅ **Fully Supported & Functional**

The backend has a sophisticated, AI-driven mechanism for taking a user's "tech stack" (skills) and automatically assigning tasks based on those skills. 

### How the Logic Flows:

1. **Skill Definition (`PUT /api/skills/users/skills`)**
   Users can define their tech stack which is stored in the `skills` array on the `User` model.

2. **AI Task Generation (`POST /api/ai/generate-tasks`)**
   The frontend can send a project description along with a `techStack` array. The backend uses the `ai.service.js` (calling Gemini) to break the project down into an array of tasks (e.g., `[{"title": "Setup Node.js", "type": "backend"}]`).

3. **Task Assignment & Distribution (`POST /api/tasks`)**
   When creating tasks, the payload sent is `{ projectId, tasks }`. This hits `createTask` in `Task.controller.js`, which then delegates to `createTasksFromAI` in `task.service.js`.

### The Core Assignment Logic (`src/services/task.service.js`)

Inside `createTasksFromAI`:
- The backend retrieves the `Project` and the associated `Team`, populating all team `members` and their `skills`.
- It dynamically constructs a prompt for the Gemini AI:
  ```text
  You are a project manager. Assign tasks to users based on their skills.
  ...
  Users:
  - id: 12345, skills: react, tailwind
  - id: 67890, skills: node.js, mongodb
  ```
- The AI responds with a JSON array mapping each task to the best-suited user's `_id` based on matching the task's requirements to the user's skills.
- The AI also intelligently assigns task "weights" (`weightAssigned`) based on complexity, totaling 100 per project.
- The backend parses this AI assignment, applies any manual `overrides` if provided, and bulk creates the `Task` documents in the database.

**Conclusion on Feature:** 
The feature exists exactly as requested. It is triggered by `POST /api/tasks`, expects a payload containing an array of tasks and the `projectId`, and actively uses an LLM to read the team members' skills from the DB to logically assign work.
