import Fastify from "fastify";
import cors from "@fastify/cors";
import { ZodError } from "zod";
import { registerRoutes } from "./routes/register.js";


const app = Fastify({ logger: true });
await app.register(cors, {
  origin: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
});
await registerRoutes(app);

app.setErrorHandler((err, _req, reply) => {
  if (err instanceof ZodError) {
    reply.status(400).send({ error: "参数无效", details: err.flatten() });
    return;
  }
  const v = err as { validation?: unknown };
  if (v.validation) {
    reply.status(400).send({ error: "校验失败", details: v.validation });
    return;
  }
  reply.send(err);
});

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

await app.listen({ port, host });
console.log(`家庭教育管家 API http://localhost:${port}`);
