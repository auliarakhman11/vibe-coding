import { Elysia, t } from 'elysia';
import { loginUserService } from '../service/service-auth';

export const authRoute = new Elysia({ prefix: '/api' })
  .post('/login', async ({ body, set }) => {
    try {
      const { username, password } = body as any;

      const token = await loginUserService({
        username,
        password,
      });

      set.status = 200;
      return {
        status: 200,
        message: 'User login successfully',
        data: token,
      };
    } catch (error: any) {
      set.status = 401;
      return {
        status: 401,
        message: 'User not found',
        data: null,
      };
    }
  }, {
    body: t.Object({
      username: t.String(),
      password: t.String(),
    }),
    detail: {
      tags: ['Auth'],
      summary: 'Login user',
      description: 'Mengautentikasi user menggunakan username dan password. Mengembalikan token UUID untuk digunakan sebagai Bearer token.',
    },
    response: {
      200: t.Object({
        status: t.Number(),
        message: t.String(),
        data: t.String(),
      }),
      401: t.Object({
        status: t.Number(),
        message: t.String(),
        data: t.Null(),
      }),
    }
  });
