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
    })
  });
