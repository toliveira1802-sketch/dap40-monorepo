import { useMemo, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useSession } from "../features/shared/auth";
import { apiTrpc } from "./apiTrpc";

const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:3001";

/**
 * Provider do tRPC real (CRM + access.capabilities) apontando para a API Fastify.
 * Headers levam o profile UUID + role da sessão Supabase.
 */
export function ApiTrpcProvider({ children }: { children: ReactNode }) {
  const { session } = useSession();
  const [queryClient] = useState(() => new QueryClient());

  const trpcClient = useMemo(
    () =>
      apiTrpc.createClient({
        links: [
          httpBatchLink({
            url: `${API_URL}/trpc`,
            headers() {
              if (!session) return {};
              return {
                "x-dap-user-id": session.id,
                "x-dap-user-role": session.role ?? "CONSULTOR",
              };
            },
          }),
        ],
      }),
    [session]
  );

  return (
    <apiTrpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </apiTrpc.Provider>
  );
}
