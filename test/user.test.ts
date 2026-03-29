import { describe, it, expect, beforeEach } from 'bun:test';
import app from '../src/index';
import { cleanDatabase } from './helper';

describe('User Registration (POST /api/users)', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  const validUser = {
    name: 'Test Project User',
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
  };

  it('Skenario 1: Registrasi berhasil', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validUser),
      })
    );

    const result = await response.json();
    expect(response.status).toBe(201);
    expect(result.status).toBe(201);
    expect(result.message).toBe('User created successfully');
    expect(result.data.username).toBe(validUser.username);
    expect(result.data.password).toBeUndefined(); // Password tidak boleh dikembalikan
  });

  it('Skenario 2 & 3: Registrasi gagal: duplikasi username/email', async () => {
    // Registrasi pertama
    await app.handle(
      new Request('http://localhost/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validUser),
      })
    );

    // Registrasi kedua dengan data yang sama
    const response = await app.handle(
      new Request('http://localhost/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validUser),
      })
    );

    const result = await response.json();
    expect(response.status).toBe(400);
    expect(result.status).toBe(400);
    expect(result.message).toBe('User already exists');
  });

  it('Skenario 4: Validasi gagal: name kosong', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validUser, name: '' }),
      })
    );

    expect(response.status).toBe(400);
    const result = await response.json();
    expect(result.message).toBe('Validation error');
  });

  it('Skenario 5: Validasi gagal: name terlalu panjang', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validUser, name: 'A'.repeat(300) }),
      })
    );

    expect(response.status).toBe(400);
  });

  it('Skenario 6: Validasi gagal: username terlalu pendek', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validUser, username: 'ab' }),
      })
    );

    expect(response.status).toBe(400);
  });

  it('Skenario 8: Validasi gagal: password terlalu pendek', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validUser, password: '123' }),
      })
    );

    expect(response.status).toBe(400);
  });

  it('Skenario 9: Validasi gagal: field wajib tidak dikirim', async () => {
    const dataWithoutName = { ...validUser };
    delete (dataWithoutName as any).name;

    const response = await app.handle(
      new Request('http://localhost/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataWithoutName),
      })
    );

    expect(response.status).toBe(400);
  });
});
