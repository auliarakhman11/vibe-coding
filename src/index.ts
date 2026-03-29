import { Elysia } from 'elysia';
import { openapi } from '@elysiajs/openapi';
import { db } from './db';
import { userRoute } from './route/route-user';
import { authRoute } from './route/route-auth';

const app = new Elysia()
  .use(openapi({
    path: '/swagger',
    provider: 'swagger-ui',
    documentation: {
      info: {
        title: 'Vibe Coding API',
        version: '1.0.0',
        description: 'REST API untuk manajemen pengguna (registrasi, login, profil, logout).',
      },
    },
  }))
  .use(userRoute)
  .use(authRoute)
  .get('/', () => {
    return { status: 'ok', message: 'ElysiaJS + Drizzle server is running!' };
  });


if (process.env.NODE_ENV !== 'test') {
  app.listen(3000);
  console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
  );
}

export default app;

