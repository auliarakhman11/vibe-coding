import { describe, it, expect, beforeEach } from 'bun:test';
import app from '../src/index';
import { cleanDatabase, createTestUser } from './helper';

describe('User Authentication (POST /api/login)', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  const validCredentials = {
    username: 'testlogin',
    password: 'password123',
  };

  const validUserData = {
    name: 'Test Login User',
    username: 'testlogin',
    email: 'testlogin@example.com',
    password: 'password123',
  };

  it('Skenario 1: Login berhasil', async () => {
    // Buat user terlebih dahulu
    await createTestUser(app, validUserData);

    const response = await app.handle(
      new Request('http://localhost/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validCredentials),
      })
    );

    const result = await response.json();
    expect(response.status).toBe(200);
    expect(result.status).toBe(200);
    expect(result.message).toBe('User login successfully');
    expect(result.data).toBeDefined(); // Token must be provided
    expect(typeof result.data).toBe('string');
  });

  it('Skenario 2: Login gagal: username salah', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validCredentials, username: 'wronguser' }),
      })
    );

    const result = await response.json();
    expect(response.status).toBe(401);
    expect(result.status).toBe(401);
    expect(result.message).toBe('User not found');
  });

  it('Skenario 3: Login gagal: password salah', async () => {
    await createTestUser(app, validUserData);

    const response = await app.handle(
      new Request('http://localhost/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validCredentials, password: 'wrongpassword' }),
      })
    );

    const result = await response.json();
    expect(response.status).toBe(401);
  });

  it('Skenario 5: Login berulang menghasilkan token berbeda', async () => {
    await createTestUser(app, validUserData);

    // Login pertama
    const res1 = await app.handle(
      new Request('http://localhost/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validCredentials),
      })
    ).then(r => r.json());

    // Login kedua
    const res2 = await app.handle(
      new Request('http://localhost/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validCredentials),
      })
    ).then(r => r.json());

    expect(res1.data).not.toBe(res2.data);
  });
});
