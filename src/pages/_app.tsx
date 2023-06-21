import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { ChakraProvider } from "@chakra-ui/react";
import { ApolloProviderWrapper } from "~/clients/apollo-provider";

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <ApolloProviderWrapper>
        <ChakraProvider>
          <Component {...pageProps} />
        </ChakraProvider>
      </ApolloProviderWrapper>
    </SessionProvider>
  );
}
