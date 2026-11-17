import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type PropsWithChildren } from "react";
import { flushMutationQueue } from "../shared/offline/mutationQueue";

export function AppProviders({ children }: PropsWithChildren) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, retry: 1, networkMode: "offlineFirst" },
          mutations: { networkMode: "offlineFirst" },
        },
      }),
  );

  useEffect(() => {
    const flush = () => { void flushMutationQueue(); };
    window.addEventListener("online", flush);
    if (navigator.onLine) flush();
    return () => window.removeEventListener("online", flush);
  }, []);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
