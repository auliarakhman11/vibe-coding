import { describe, it, expect, beforeEach } from 'bun:test';
import app from '../src/index';
import { cleanDatabase, createTestUser, loginTestUser } from './helper';

describe('User Logout (DELETE /api/users/logout)', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  const validUserData = {
    name: 'Test Logout User',
    username: 'testlogout',
    email: 'testlogout@example.com',
    password: 'password123',
  };

  it('Skenario 1: Logout berhasil', async () => {
    await createTestUser(app, validUserData);
    const loginRes = await loginTestUser(app, {
      username: validUserData.username,
      password: validUserData.password,
    });
    const token = loginRes.data;

    const response = await app.handle(
      new Request('http://localhost/api/users/logout', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      })
    );

    const result = await response.json();
    expect(response.status).toBe(200);
    expect(result.message).toBe('Logout success');
  });

  it('Skenario 2: Setelah logout, token tidak bisa dipakai lagi', async () => {
    await createTestUser(app, validUserData);
    const loginRes = await loginTestUser(app, {
      username: validUserData.username,
      password: validUserData.password,
    });
    const token = loginRes.data;

    // Logout
    await app.handle(
      new Request('http://localhost/api/users/logout', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      })
    );

    // Call get current with same token
    const response = await app.handle(
      new Request('http://localhost/api/users/current', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      })
    );

    const result = await response.json();
    expect(response.status).toBe(401);
  });

  it('Skenario 3: Logout idempotent', async () => {
    await createTestUser(app, validUserData);
    const loginRes = await loginTestUser(app, {
      username: validUserData.username,
      password: validUserData.password,
    });
    const token = loginRes.data;

    // Logout 1
    const res1 = await app.handle(
      new Request('http://localhost/api/users/logout', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      })
    );
    expect(res1.status).toBe(200);

    // Logout 2 (sudah tidak ada sesinya)
    const res2 = await app.handle(
      new Request('http://localhost/api/users/logout', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      })
    );
    expect(res2.status).toBe(200);
  });

  it('Skenario 5: Gagal: token tidak valid (Idempotent success)', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/users/logout', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer token-palsu`
        },
      })
    );

    // Berdasarkan spek: idempotent return 200 even if no session deleted
    expect(response.status).toBe(200);
  });

  it('Skenario 6: Gagal: format header salah', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/users/logout', {
        method: 'DELETE',
        headers: {
          'Authorization': `invalid-token`
        },
      })
    );

    const result = await response.json();
    expect(response.status).toBe(401);
    expect(result.message).toBe('Logout failed');
  });
});
