import { useMemo } from "react";
import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { GraphQLError } from "graphql";
import { useSession } from "next-auth/react";

const httpLink = new HttpLink({
  uri: "https://api.github.com/graphql",
});

const getClient = (githubAccessToken: string | undefined) => {
  const authMiddleware = setContext(async (_operation, { headers }) => {
    if (!githubAccessToken) throw new GraphQLError("User is not authenticated");

    return {
      headers: {
        ...headers,
        authorization: `Bearer ${githubAccessToken}`,
      },
    };
  });

  return new ApolloClient({
    link: from([authMiddleware, httpLink]),
    cache: new InMemoryCache(),
  });
};

export const ApolloProviderWrapper: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { data: session } = useSession();

  const client = useMemo(() => getClient(session?.user.githubAccessToken), [session?.user.githubAccessToken]);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
