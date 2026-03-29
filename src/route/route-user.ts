import { Elysia, t } from 'elysia';
import { registerUserService, getCurrentUserService, logoutUserService } from '../service/service-user';

export const userRoute = new Elysia({ prefix: '/api' })
  .onError(({ code, set, error }) => {
    if (code === 'VALIDATION') {
      set.status = 400;
      return {
        status: 400,
        message: 'Validation error',
        data: null,
      };
    }
  })
  .post('/users', async ({ body, set }) => {
    try {
      const { name, username, email, password } = body as any;

      const newUser = await registerUserService({
        name,
        username,
        email,
        password,
      });

      set.status = 201;
      return {
        status: 201,
        message: 'User created successfully',
        data: newUser,
      };
    } catch (error: any) {
      set.status = 400;
      return {
        status: 400,
        message: error.message || 'Error creating user',
        data: null,
      };
    }
  }, {
    body: t.Object({
      name: t.String({ minLength: 1, maxLength: 255 }),
      username: t.String({ minLength: 3, maxLength: 255 }),
      email: t.String({ minLength: 5, maxLength: 255 }),
      password: t.String({ minLength: 8, maxLength: 255 }),
    }),
    detail: {
      tags: ['User'],
      summary: 'Registrasi user baru',
      description: 'Mendaftarkan user baru dengan data name, username, email, dan password.',
    },
    response: {
      201: t.Object({
        status: t.Number(),
        message: t.String(),
        data: t.Object({
          id: t.Number(),
          name: t.String(),
          username: t.String(),
          email: t.String(),
          created_at: t.Any(),
          updated_at: t.Any(),
        }),
      }),
      400: t.Object({
        status: t.Number(),
        message: t.String(),
        data: t.Null(),
      }),
    }
  })



  .derive(({ headers }) => {
    const authHeader = headers.authorization as string | undefined;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { token: null as string | null };
    }
    const token = authHeader.split(' ')[1];
    return { token: token || null };
  })
  .get('/users/current', async ({ token, set }) => {
    try {
      if (!token) throw new Error('Unauthorized');
      
      const user = await getCurrentUserService(token);

      set.status = 200;
      return {
        status: 200,
        message: 'User current found',
        data: user,
      };
    } catch (error: any) {
      set.status = 401;
      return {
        status: 401,
        message: 'Unauthorized',
        data: null,
      };
    }
  }, {
    detail: {
      tags: ['User'],
      summary: 'Get current user',
      description: 'Mengambil data profil user yang sedang login berdasarkan Bearer token.',
    },
    response: {
      200: t.Object({
        status: t.Number(),
        message: t.String(),
        data: t.Object({
          id: t.Number(),
          username: t.String(),
          email: t.String(),
          created_at: t.Any(),
          updated_at: t.Any(),
        }),
      }),
      401: t.Object({
        status: t.Number(),
        message: t.String(),
        data: t.Null(),
      }),
    }
  })
  .delete('/users/logout', async ({ token, set }) => {
    try {
      if (!token) throw new Error('Logout failed');
      
      await logoutUserService(token);

      set.status = 200;
      return {
        status: 200,
        message: 'Logout success',
        data: null,
      };
    } catch (error: any) {
      set.status = 401;
      return {
        status: 401,
        message: 'Logout failed',
        data: null,
      };
    }
  }, {
    detail: {
      tags: ['User'],
      summary: 'Logout user',
      description: 'Menghapus session user berdasarkan Bearer token (idempotent).',
    },
    response: {
      200: t.Object({
        status: t.Number(),
        message: t.String(),
        data: t.Null(),
      }),
      401: t.Object({
        status: t.Number(),
        message: t.String(),
        data: t.Null(),
      }),
    }
  });
