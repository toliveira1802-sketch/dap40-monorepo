import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../../api/src/router";

/** Cliente tRPC tipado contra a API Fastify (`/trpc`). */
export const apiTrpc = createTRPCReact<AppRouter>();
