import { Elysia } from 'elysia';
import { db } from './db';
import { userRoute } from './route/route-user';
import { authRoute } from './route/route-auth';

const app = new Elysia()
  .use(userRoute)
  .use(authRoute)
  .get('/', () => {
    return { status: 'ok', message: 'ElysiaJS + Drizzle server is running!' };
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
