import { Elysia } from 'elysia';
import { db } from './db';
import { userRoute } from './route/route-user';

const app = new Elysia()
  .use(userRoute)
  .get('/', () => {
    return { status: 'ok', message: 'ElysiaJS + Drizzle server is running!' };
  })
  .listen(3000);


console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
