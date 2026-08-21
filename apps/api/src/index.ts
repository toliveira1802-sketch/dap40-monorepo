import Fastify from "fastify";
import cors from "@fastify/cors";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import * as dotenv from "dotenv";
import { createContext } from "./context";
import { registerCrmWebhookRoutes } from "./crm/crmWebhooks";
import { appRouter } from "./router";

dotenv.config({ path: "../../.env" });

const server = Fastify({
  logger: true,
});

server.register(cors, {
  origin: true,
});

server.get("/health", async () => {
  return {
    status: "ok",
    service: "DAP40 API",
    timestamp: new Date().toISOString(),
  };
});

const start = async () => {
  try {
    await server.register(fastifyTRPCPlugin, {
      prefix: "/trpc",
      trpcOptions: {
        router: appRouter,
        createContext,
      },
    });

    await registerCrmWebhookRoutes(server);

    const port = Number(process.env.PORT) || 3001;
    await server.listen({ port, host: "0.0.0.0" });
    console.log(`DAP40 API rodando em http://localhost:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();

export type { AppRouter } from "./router";
export { appRouter } from "./router";
export { crmRouter } from "./crm/crmRouter";
