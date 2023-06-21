import { useMemo } from "react";
import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = new HttpLink({
  uri: "https://api.github.com/graphql",
});

export const ApolloProviderWrapper: React.FC<React.PropsWithChildren> = ({ children }) => {
  const client = useMemo(() => {
    const authMiddleware = setContext(async (_operation, { headers }) => {
      const { accessToken } = await fetch("/api/auth/session").then((res) => res.json());

      return {
        headers: {
          ...headers,
          authorization: `Bearer ${accessToken}`,
        },
      };
    });

    return new ApolloClient({
      link: from([authMiddleware, httpLink]),
      cache: new InMemoryCache(),
    });
  }, []);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
