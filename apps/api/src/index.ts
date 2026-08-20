import Fastify from "fastify";
import cors from "@fastify/cors";
import * as dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const server = Fastify({
  logger: true
});

server.register(cors, {
  origin: true
});

server.get("/health", async () => {
  return { status: "ok", service: "DAP40 API", timestamp: new Date().toISOString() };
});

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3001;
    await server.listen({ port, host: "0.0.0.0" });
    console.log(`DAP40 API rodando em http://localhost:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
