import { db } from '../db';
import { users } from '../db/schema';
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
