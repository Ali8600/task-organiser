# AICI Challenge – Full Stack Todo App

A full-stack Todo application built for the AICI Challenge. It features user authentication, task creation, management, and real-time updates, with containerized services using Docker and a modern frontend using React + Vite.

---

##  Tech Stack

* **Backend**: Node.js, Express, Prisma, PostgreSQL
* **Frontend**: React + Vite, TypeScript
* **Authentication**: JWT
* **Database**: PostgreSQL (via Docker)
* **DevOps**: Docker, Docker Compose

---

## Project Structure

```
AICI-Challenge/
 - user-service/           # Handles user registration/login
 - todo-service/           # Handles todos CRUD
 - frontend/               # React + Vite frontend
 - docker-compose.yml      # Compose for DB + services
 - README.md
```

---

## Setup & Installation

### 1. Clone the Repository

```
git clone https://github.com/your-username/aici-todo-app.git
cd aici-todo-app
```

### 2. Create Environment Files

#### `user-service/.env`

```
DATABASE_URL=postgresql://postgres:password@user-db:5432/userdb
JWT_SECRET=your_jwt_secret
```

#### `todo-service/.env`

```
DATABASE_URL=postgresql://postgres:password@todo-db:5432/tododb
JWT_SECRET=your_jwt_secret
```

### 3. Build & Start the App

```
docker compose up --build
```

> This spins up:
>
> * PostgreSQL for both services
> * Express APIs for users & todos
> * Runs Prisma migrations
> * React frontend (if added under `/frontend`)

---

## 🔧 Scripts & Commands

### Backend (both services):
I would higly recommend to run the backend using dockerised containers

```
NOTE: I would higly recommend to run the backend using dockerised containers over these:

npm run dev          # Start in dev mode
npm run build        # Build TypeScript
npm start            # Start production server
npm run prisma:migrate  # Apply schema changes
npm run prisma:generate # Regenerate Prisma client
```

---

## 🔐 Authentication Flow

* Register via: `POST /api/users/register`
* Login via: `POST /api/users/login`
* Get JWT Token
* Send `Authorization: Bearer <token>` in all Todo routes

---

## 📆 API Endpoints

### User Service

* `POST /api/users/register`
* `POST /api/users/login`

### Todo Service

* `GET /api/todos`
* `GET /api/todos/:id`
* `POST /api/todos`
* `PUT /api/todos/:id`
* `DELETE /api/todos/:id`

> All todo endpoints require JWT Authorization header as mentioned in the challenge.

---

## API Documentation

### Postman Collection

You can import the Postman collection from:

```
docs/AICI.postman_collection.json
```

Or use the OpenAPI file:

```
docs/openapi.yaml
```

---

## 📝 Unit Testing

Unit test files are located in each service's `tests/` directory.

```bash
npm test
```

Tests include:

* User registration/login flow
* JWT validation
* CRUD operations for todos

---

## 🌐 Deployment (Optional)

You can deploy the frontend using Vercel and backend using Render, Railway, or Fly.io.

### Example:

```md
Frontend: https://aici-todo.vercel.app
User Service: https://user-service.onrender.com
Todo Service: https://todo-service.onrender.com
```



---

Developed by [Ali Idrees](https://github.com/ali8600)

Challenge submitted for **AICI Full-Stack Assessment**
