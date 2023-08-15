import "@/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";
import { dark, neobrutalism } from "@clerk/themes";

const qc = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={qc}>
      <ClerkProvider
        appearance={{
          baseTheme: neobrutalism,
        }}
      >
        <Component {...pageProps} />
      </ClerkProvider>
    </QueryClientProvider>
  );
}
