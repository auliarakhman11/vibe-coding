import { Elysia, t } from 'elysia';
import { registerUserService } from '../service/service-user';

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
  });
