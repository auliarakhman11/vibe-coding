import { db } from '../db';
import { users, session } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * Mengautentikasi user dan membuat session baru.
 * - Mencari user berdasarkan username di database.
 * - Memvalidasi password dengan membandingkan hash menggunakan bcryptjs.
 * - Membuat token UUID baru menggunakan crypto.randomUUID().
 * - Menyimpan token ke tabel session dengan relasi ke user_id.
 * @param data - Object berisi username dan password.
 * @returns Token UUID string yang bisa digunakan sebagai Bearer token.
 * @throws Error jika username tidak ditemukan atau password salah.
 */
export const loginUserService = async (data: any) => {
  const { username, password } = data;

  // 1. Find user by username
  const [user]: any = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (!user) {
    throw new Error('User not found');
  }

  // 2. Validate password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('User not found'); // Generic error for security
  }

  // 3. Generate UUID token
  const token = crypto.randomUUID();

  // 4. Record session
  await db.insert(session).values({
    token,
    user_id: user.id,
  });

  return token;
};
