/// <reference types="jest" />
import request from 'supertest';
import { PrismaClient } from '../src/generated/prisma';
import app from '../src/app';

const prisma = new PrismaClient();

// Test data
const validUser = {
  email: 'test@example.com',
  password: 'password123'
};

const invalidPasswordUser = {
  email: 'test@example.com',
  password: '123' // To check lenghth of password ;)
};

describe('User Authentication', () => {
  beforeAll(async () => {
    // Connect to database
    await prisma.$connect();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    // Clean up and disconnect
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  describe('POST /api/users/register - User Registration', () => {
    it('should register a new user with valid email and password', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send(validUser)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'User registered');

      // Verify user was created in database
      const userInDb = await prisma.user.findUnique({
        where: { email: validUser.email }
      });
      expect(userInDb).toBeTruthy();
      expect(userInDb?.email).toBe(validUser.email);
      // Password should be hashed, not plain text
      expect(userInDb?.password).not.toBe(validUser.password);
    });

    it('should return 409 Conflict when email is already in use', async () => {
      // First registration
      await request(app)
        .post('/api/users/register')
        .send(validUser)
        .expect(201);

      // Second registration with same email
      const response = await request(app)
        .post('/api/users/register')
        .send(validUser)
        .expect(409);

      expect(response.body).toHaveProperty('error', 'Email already in use');
    });

    it('should return 400 Bad Request for password length < 6', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send(invalidPasswordUser)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid email or password');

      // Verify no user was created
      const userInDb = await prisma.user.findUnique({
        where: { email: invalidPasswordUser.email }
      });
      expect(userInDb).toBeNull();
    });

    it('should return 400 Bad Request for missing email', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({ password: 'password123' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid email or password');
    });

    it('should return 400 Bad Request for missing password', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid email or password');
    });

    it('should return 400 Bad Request for empty request body', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid email or password');
    });

    it('should hash the password before storing', async () => {
      await request(app)
        .post('/api/users/register')
        .send(validUser)
        .expect(201);

      const userInDb = await prisma.user.findUnique({
        where: { email: validUser.email }
      });

      expect(userInDb?.password).not.toBe(validUser.password);
      expect(userInDb?.password).toMatch(/^\$2[ayb]\$.{56}$/); // bcrypt hash pattern
    });
  });

  describe('POST /api/users/login - User Login', () => {
    beforeEach(async () => {
      // Register a user for login tests
      await request(app)
        .post('/api/users/register')
        .send(validUser);
    });

    it('should login successfully with correct credentials and return JWT', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send(validUser)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(typeof response.body.token).toBe('string');
      expect(response.body.token.length).toBeGreaterThan(0);

      // Verify JWT structure (should have 3 parts separated by dots)
      const tokenParts = response.body.token.split('.');
      expect(tokenParts).toHaveLength(3);
    });

    it('should include user identification in JWT payload', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send(validUser)
        .expect(200);

      const token = response.body.token;
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      
      expect(payload).toHaveProperty('userId');
      expect(payload).toHaveProperty('exp'); // Expiration time
      expect(payload).toHaveProperty('iat'); // Issued at time
    });

    it('should return 401 Unauthorized for wrong password', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: validUser.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
      expect(response.body).not.toHaveProperty('token');
    });

    it('should return 401 Unauthorized for non-existent email', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'nonexistent@example.com',
          password: validUser.password
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
      expect(response.body).not.toHaveProperty('token');
    });

    it('should return 401 Unauthorized for missing password', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({ email: validUser.email })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should return 401 Unauthorized for missing email', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({ password: validUser.password })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should not expose password in any response', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send(validUser)
        .expect(200);

      const responseString = JSON.stringify(response.body);
      expect(responseString).not.toContain(validUser.password);
      expect(responseString).not.toContain('password');
    });

    it('should not expose password in error responses', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: validUser.email,
          password: 'wrongpassword'
        })
        .expect(401);

      const responseString = JSON.stringify(response.body);
      expect(responseString).not.toContain('wrongpassword');
      expect(responseString).not.toContain(validUser.password);
    });

    it('should handle empty request body gracefully', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({})
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });
  });

  describe('Security Tests', () => {
    it('should not allow SQL injection in email field during registration', async () => {
      const maliciousEmail = "test@example.com'; DROP TABLE users; --";
      
      const response = await request(app)
        .post('/api/users/register')
        .send({
          email: maliciousEmail,
          password: 'password123'
        });

      // Should either fail validation or create user safely
      if (response.status === 201) {
        // If user was created, verify table still exists and only intended user was created
        const users = await prisma.user.findMany();
        expect(users.length).toBe(1);
        expect(users[0]?.email).toBe(maliciousEmail);
      } else {
        expect(response.status).toBe(400);
      }
    });

    it('should not allow SQL injection in email field during login', async () => {
      // First register a normal user
      await request(app)
        .post('/api/users/register')
        .send(validUser);

      const maliciousEmail = "test@example.com' OR '1'='1"; 
      
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: maliciousEmail,
          password: validUser.password
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should properly validate email format', async () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'test@',
        '',
        null,
        undefined
      ];

      for (const email of invalidEmails) {
        const response = await request(app)
          .post('/api/users/register')
          .send({
            email: email,
            password: 'password123'
          });
        
        expect(response.status).toBe(400);
      }
    });
  });
});
