# AICI Challenge – Full Stack Todo App

A full-stack Todo application built for the AICI Challenge. It features user authentication, task creation, management, and real-time updates, with containerized services using Docker and a modern frontend using React + Vite.

---
NOTE: The Postman collection's link has been added at the end of the document. 

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

### 2. Create Environment Files (REQUIRED)
⚠️ **Critical**: The app will not start without these .env files!

**Important**: You must create these files before starting the app.

Create `user-service/.env` & `todo-service/.env`:

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

### 3. Build & Start the App's Backend:

# Start all services
```
docker compose up --build 
```
or

```
docker compose up --d
```


> This spins up:
>
> * PostgreSQL for both services
> * Express APIs for users & todos
> * Runs Prisma migrations


Note: if you want to close the project, it's recommended to follow
to Stop the backend:

```
docker compose down          # Stop all services
```


---

### 4. Start App's Frontend:

##1. Firstly:
```
npm install
```

##2. Secondly (optional: if you don't have vite):
```
npm install vite@5
```

##3. Now you can run the app (in dev mode):
```
npm run dev
```



---

## Authentication Flow

* Register via: `POST /api/users/register`
* Login via: `POST /api/users/login`
* Get JWT Token
* Send `Authorization: Bearer <token>` in all Todo routes

---

## API Endpoints

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

## Unit Testing (using Jest)

 ### Unit test files are located in each service's tests/ directory.

   IMP: Tests are located inside each service, and they can be run once you are in that directory/folder.

   #### First Step (Choose the service you want to run down the unit test cases of...)

   Unit-Tests for `aici-challenge/user-service`
   ```
   cd user-service
   ```

   ###OR

   Unit-Tests for `aici-challenge/todo-service`
   ```
   cd todo-service
   ```

   #### Second Step (Simply run this command now, and enjoy ;))

   ```
   npm test
   ```

   Tests include:
   
   User registration/login flow
   
   JWT validation
   
   CRUD operations for todos

---
## API Documentation

### Postman Collection

You can import and utilise the Postman collection from this link:

```
https://www.postman.com/mission-specialist-78111165/workspace/aici-challenge-ali/collection/27922011-b5bef99e-2b90-4889-bd73-f10fe66480e9?action=share&creator=27922011
```

You can import the Postman collection json from:

```
aici-challenge/AICI.postman_collection_ali.json
```


---

Developed by [Ali Idrees](https://github.com/ali8600)

Challenge submitted for **AICI Full-Stack Assessment**
