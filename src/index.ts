import { Elysia } from 'elysia';
import { db } from './db';

const app = new Elysia()
  .get('/', () => {
    return { status: 'ok', message: 'ElysiaJS + Drizzle server is running!' };
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
