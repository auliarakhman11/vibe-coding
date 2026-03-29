import { db } from '../src/db';
import { users, session } from '../src/db/schema';

export const cleanDatabase = async () => {
  // Order matters due to foreign keys
  await db.delete(session);
  await db.delete(users);
};

export const createTestUser = async (app: any, data: any) => {
  return await app.handle(
    new Request('http://localhost/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  ).then((res: Response) => res.json());
};

export const loginTestUser = async (app: any, credentials: any) => {
  return await app.handle(
    new Request('http://localhost/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })
  ).then((res: Response) => res.json());
};
