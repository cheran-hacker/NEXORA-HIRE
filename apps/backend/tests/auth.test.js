import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../server.js';
import { User } from '../src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

beforeAll(async () => {
  // Connect to a separate test database
  const testDbUri = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/nexora_test';
  await mongoose.connect(testDbUri);
});

afterAll(async () => {
  // Clean up and disconnect
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('Auth API Endpoints', () => {
  const testUser = {
    name: 'Jest Tester',
    email: 'jest@test.com',
    password: 'securepassword123',
    role: 'Alumni'
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('name', testUser.name);
      expect(res.body.user).toHaveProperty('email', testUser.email);
    });

    it('should fail if email is already registered', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.message).toContain('User already exists');
    });

    it('should fail validation if role is invalid', async () => {
      const invalidUser = { ...testUser, email: 'new@test.com', role: 'InvalidRole' };
      const res = await request(app)
        .post('/api/auth/register')
        .send(invalidUser);
      
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('token');
    });

    it('should fail login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });
      
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('success', false);
    });
  });
});
