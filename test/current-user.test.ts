import { describe, it, expect, beforeEach } from 'bun:test';
import app from '../src/index';
import { cleanDatabase, createTestUser, loginTestUser } from './helper';

describe('Get Current User (GET /api/users/current)', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  const validUserData = {
    name: 'Test Current User',
    username: 'testcurrent',
    email: 'testcurrent@example.com',
    password: 'password123',
  };

  it('Skenario 1: Berhasil mendapatkan user', async () => {
    await createTestUser(app, validUserData);
    const loginRes = await loginTestUser(app, {
      username: validUserData.username,
      password: validUserData.password,
    });
    const token = loginRes.data;

    const response = await app.handle(
      new Request('http://localhost/api/users/current', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      })
    );

    const result = await response.json();
    expect(response.status).toBe(200);
    expect(result.status).toBe(200);
    expect(result.data.username).toBe(validUserData.username);
    expect(result.data.email).toBe(validUserData.email);
    expect(result.data.password).toBeUndefined(); // Password must not be returned
  });

  it('Skenario 2: Gagal: tanpa header Authorization', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/users/current', {
        method: 'GET',
      })
    );

    const result = await response.json();
    expect(response.status).toBe(401);
    expect(result.message).toBe('Unauthorized');
  });

  it('Skenario 3: Gagal: token tidak valid', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/users/current', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer token-asal-asalan`
        },
      })
    );

    const result = await response.json();
    expect(response.status).toBe(401);
  });

  it('Skenario 4: Gagal: format header salah', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/users/current', {
        method: 'GET',
        headers: {
          'Authorization': `invalid-format-token`
        },
      })
    );

    const result = await response.json();
    expect(response.status).toBe(401);
  });
});
