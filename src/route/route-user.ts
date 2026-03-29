import { Elysia, t } from 'elysia';
import { registerUserService, getCurrentUserService, logoutUserService } from '../service/service-user';

export const userRoute = new Elysia({ prefix: '/api' })
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
      name: t.String(),
      username: t.String(),
      email: t.String(),
      password: t.String(),
    })
  })
  .get('/users/current', async ({ headers, set }) => {
    try {
      const authHeader = headers.authorization;
      if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
        throw new Error('Unauthorized');
      }

      const token = authHeader.split(' ')[1];
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
  })
  .delete('/users/logout', async ({ headers, set }) => {
    try {
      const authHeader = headers.authorization;
      if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
        throw new Error('Logout failed');
      }

      const token = authHeader.split(' ')[1];
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
  });
