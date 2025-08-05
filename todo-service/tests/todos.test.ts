/// <reference types="jest" />
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '../src/generated/prisma';
import app from '../src/app';

const prisma = new PrismaClient();

// Helper function to create a JWT token for testing
function createTestToken(userId: number): string {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '1h' });
}

// Test data
const testUser1 = { id: 1 };
const testUser2 = { id: 2 };

const validTodo = {
  title: 'Test Todo',
  description: 'This is a test todo'
};

const validTodoUpdate = {
  title: 'Updated Todo',
  description: 'This is an updated todo',
  isCompleted: true
};

describe('Todo Service CRUD Operations', () => {
  let user1Token: string;
  let user2Token: string;
  let createdTodoId: number;

  beforeAll(async () => {
    // Connect to database
    await prisma.$connect();
    
    // Generate test tokens
    user1Token = createTestToken(testUser1.id);
    user2Token = createTestToken(testUser2.id);
  });

  beforeEach(async () => {
    // Clean up database before each test
    await prisma.todo.deleteMany({});
  });

  afterAll(async () => {
    // Clean up and disconnect
    await prisma.todo.deleteMany({});
    await prisma.$disconnect();
  });

  describe('User Story 1: Create Todo', () => {
    it('should create a new todo with valid JWT and return 201 Created', async () => {
      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${user1Token}`)
        .send(validTodo)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(validTodo.title);
      expect(response.body.description).toBe(validTodo.description);
      expect(response.body.userId).toBe(testUser1.id);
      expect(response.body.isCompleted).toBe(false);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');

      // Verify todo was created in database
      const todoInDb = await prisma.todo.findUnique({
        where: { id: response.body.id }
      });
      expect(todoInDb).toBeTruthy();
      expect(todoInDb?.userId).toBe(testUser1.id);
      
      createdTodoId = response.body.id;
    });

    it('should associate the created todo with the authenticated user', async () => {
      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${user1Token}`)
        .send(validTodo)
        .expect(201);

      expect(response.body.userId).toBe(testUser1.id);

      // Verify in database that it belongs to user1
      const todoInDb = await prisma.todo.findUnique({
        where: { id: response.body.id }
      });
      expect(todoInDb?.userId).toBe(testUser1.id);
    });

    it('should return 401 Unauthorized when JWT is missing', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send(validTodo)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access denied. No token provided.');
    });

    it('should return 401 Unauthorized when JWT is invalid', async () => {
      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', 'Bearer invalid-token')
        .send(validTodo)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid token.');
    });

    it('should return 400 Bad Request when title is missing', async () => {
      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ description: 'Todo without title' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Title is required');
    });

    it('should return 400 Bad Request when title is empty', async () => {
      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ title: '', description: 'Todo with empty title' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Title is required');
    });

    it('should create todo with only title (description optional)', async () => {
      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ title: 'Todo without description' })
        .expect(201);

      expect(response.body.title).toBe('Todo without description');
      expect(response.body.description).toBeNull();
    });
  });

  describe('User Story 2: Read Todos', () => {
    beforeEach(async () => {
      // Create test todos for different users
      await prisma.todo.createMany({
        data: [
          { title: 'User 1 Todo 1', userId: testUser1.id },
          { title: 'User 1 Todo 2', userId: testUser1.id },
          { title: 'User 2 Todo 1', userId: testUser2.id },
        ]
      });
    });

    it('should return 200 OK with list of todos for authenticated user', async () => {
      const response = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      
      // Verify all todos belong to user1
      response.body.forEach((todo: any) => {
        expect(todo.userId).toBe(testUser1.id);
      });
    });

    it('should return only todos belonging to the authenticated user', async () => {
      const user1Response = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      const user2Response = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(200);

      expect(user1Response.body).toHaveLength(2);
      expect(user2Response.body).toHaveLength(1);

      // Verify separation of todos by user
      user1Response.body.forEach((todo: any) => {
        expect(todo.userId).toBe(testUser1.id);
      });

      user2Response.body.forEach((todo: any) => {
        expect(todo.userId).toBe(testUser2.id);
      });
    });

    it('should return empty array when user has no todos', async () => {
      // Clean up all todos
      await prisma.todo.deleteMany({});

      const response = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });

    it('should return 401 Unauthorized when JWT is missing', async () => {
      const response = await request(app)
        .get('/api/todos')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access denied. No token provided.');
    });

    it('should return 401 Unauthorized when JWT is invalid', async () => {
      const response = await request(app)
        .get('/api/todos')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid token.');
    });

    it('should return todos in descending order by creation date', async () => {
      const response = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      if (response.body.length > 1) {
        const firstTodo = new Date(response.body[0].createdAt);
        const secondTodo = new Date(response.body[1].createdAt);
        expect(firstTodo.getTime()).toBeGreaterThanOrEqual(secondTodo.getTime());
      }
    });
  });

  describe('User Story 3: Update Todo', () => {
    beforeEach(async () => {
      // Create a test todo
      const todo = await prisma.todo.create({
        data: { title: 'Original Todo', userId: testUser1.id }
      });
      createdTodoId = todo.id;
    });

    it('should update todo and return 200 OK with updated todo item', async () => {
      const response = await request(app)
        .put(`/api/todos/${createdTodoId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send(validTodoUpdate)
        .expect(200);

      expect(response.body.id).toBe(createdTodoId);
      expect(response.body.title).toBe(validTodoUpdate.title);
      expect(response.body.description).toBe(validTodoUpdate.description);
      expect(response.body.isCompleted).toBe(validTodoUpdate.isCompleted);
      expect(response.body.userId).toBe(testUser1.id);

      // Verify in database
      const todoInDb = await prisma.todo.findUnique({
        where: { id: createdTodoId }
      });
      expect(todoInDb?.title).toBe(validTodoUpdate.title);
      expect(todoInDb?.isCompleted).toBe(validTodoUpdate.isCompleted);
    });

    it('should only allow the owner to update the todo', async () => {
      // User2 tries to update User1's todo
      const response = await request(app)
        .put(`/api/todos/${createdTodoId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send(validTodoUpdate)
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Unauthorized');

      // Verify todo was not updated
      const todoInDb = await prisma.todo.findUnique({
        where: { id: createdTodoId }
      });
      expect(todoInDb?.title).toBe('Original Todo');
    });

    it('should return 403 Forbidden when todo does not belong to user', async () => {
      // Create todo for user2
      const user2Todo = await prisma.todo.create({
        data: { title: 'User 2 Todo', userId: testUser2.id }
      });

      const response = await request(app)
        .put(`/api/todos/${user2Todo.id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send(validTodoUpdate)
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });

    it('should return 403 Forbidden when todo does not exist', async () => {
      const nonExistentId = 99999;
      
      const response = await request(app)
        .put(`/api/todos/${nonExistentId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send(validTodoUpdate)
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });

    it('should return 401 Unauthorized when JWT is missing', async () => {
      const response = await request(app)
        .put(`/api/todos/${createdTodoId}`)
        .send(validTodoUpdate)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access denied. No token provided.');
    });

    it('should return 401 Unauthorized when JWT is invalid', async () => {
      const response = await request(app)
        .put(`/api/todos/${createdTodoId}`)
        .set('Authorization', 'Bearer invalid-token')
        .send(validTodoUpdate)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid token.');
    });

    it('should return 400 Bad Request for invalid todo ID', async () => {
      const response = await request(app)
        .put('/api/todos/invalid-id')
        .set('Authorization', `Bearer ${user1Token}`)
        .send(validTodoUpdate)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid todo ID');
    });
  });

  describe('User Story 4: Delete Todo', () => {
    beforeEach(async () => {
      // Create a test todo
      const todo = await prisma.todo.create({
        data: { title: 'Todo to Delete', userId: testUser1.id }
      });
      createdTodoId = todo.id;
    });

    it('should delete todo and return 204 No Content', async () => {
      await request(app)
        .delete(`/api/todos/${createdTodoId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(204);

      // Verify todo was deleted
      const todoInDb = await prisma.todo.findUnique({
        where: { id: createdTodoId }
      });
      expect(todoInDb).toBeNull();
    });

    it('should only allow the owner to delete the todo', async () => {
      // User2 tries to delete User1's todo
      const response = await request(app)
        .delete(`/api/todos/${createdTodoId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Unauthorized');

      // Verify todo was not deleted
      const todoInDb = await prisma.todo.findUnique({
        where: { id: createdTodoId }
      });
      expect(todoInDb).toBeTruthy();
    });

    it('should return 403 Forbidden when todo does not belong to user', async () => {
      // Create todo for user2
      const user2Todo = await prisma.todo.create({
        data: { title: 'User 2 Todo', userId: testUser2.id }
      });

      const response = await request(app)
        .delete(`/api/todos/${user2Todo.id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Unauthorized');

      // Verify todo was not deleted
      const todoInDb = await prisma.todo.findUnique({
        where: { id: user2Todo.id }
      });
      expect(todoInDb).toBeTruthy();
    });

    it('should return 403 Forbidden when todo does not exist', async () => {
      const nonExistentId = 99999;
      
      const response = await request(app)
        .delete(`/api/todos/${nonExistentId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });

    it('should return 401 Unauthorized when JWT is missing', async () => {
      const response = await request(app)
        .delete(`/api/todos/${createdTodoId}`)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access denied. No token provided.');
    });

    it('should return 401 Unauthorized when JWT is invalid', async () => {
      const response = await request(app)
        .delete(`/api/todos/${createdTodoId}`)
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid token.');
    });

    it('should return 400 Bad Request for invalid todo ID', async () => {
      const response = await request(app)
        .delete('/api/todos/invalid-id')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid todo ID');
    });
  });

  describe('JWT Authentication Tests', () => {
    it('should reject expired JWT tokens', async () => {
      const expiredToken = jwt.sign(
        { userId: testUser1.id }, 
        process.env.JWT_SECRET!, 
        { expiresIn: '-1h' } // Expired 1 hour ago
      );

      const response = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid token.');
    });

    it('should reject JWT with wrong secret', async () => {
      const wrongSecretToken = jwt.sign(
        { userId: testUser1.id }, 
        'wrong-secret', 
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${wrongSecretToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid token.');
    });

    it('should handle malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/todos')
        .set('Authorization', 'InvalidFormat')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access denied. No token provided.');
    });
  });
});
