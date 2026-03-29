import { db } from '../db';
import { users, session } from '../db/schema';
import { eq, or } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const registerUserService = async (data: any) => {
  const { name, username, email, password } = data;

  // 1. Check if user already exists
  const existingUser = await db
    .select()
    .from(users)
    .where(or(eq(users.username, username), eq(users.email, email)))
    .limit(1);

  if (existingUser.length > 0) {
    throw new Error('User already exists');
  }

  // 2. Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Insert user
  const [result]: any = await db.insert(users).values({
    name,
    username,
    email,
    password: hashedPassword,
  });

  // 4. Get the inserted user to return (for created_at and updated_at)
  // mysql2/promise insert result might return insertId
  const insertedId = result.insertId;
  const [newUser] = await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      email: users.email,
      created_at: users.created_at,
      updated_at: users.updated_at,
    })
    .from(users)
    .where(eq(users.id, insertedId))
    .limit(1);

  return newUser;
};

export const getCurrentUserService = async (token: string) => {
  // 1. Get session by token
  const [activeSession]: any = await db
    .select()
    .from(session)
    .where(eq(session.token, token))
    .limit(1);

  if (!activeSession) {
    throw new Error('Unauthorized');
  }

  // 2. Fetch user data by user_id from session
  const [user]: any = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      created_at: users.created_at,
      updated_at: users.updated_at,
    })
    .from(users)
    .where(eq(users.id, activeSession.user_id))
    .limit(1);

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
};
