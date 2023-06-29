import { useMemo } from "react";
import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { GraphQLError } from "graphql";
import { useSession } from "next-auth/react";

const httpLink = new HttpLink({
  uri: "https://api.github.com/graphql",
});

const getClient = (githubAccessToken: string | null | undefined) => {
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

export const useGithubAccessToken = () => {
  const { data: session } = useSession();
  return useMemo(
    () => session?.user?.accounts.find((account) => account.provider === "github")?.access_token,
    [session?.user?.accounts],
  );
};

export const ApolloProviderWrapper: React.FC<React.PropsWithChildren> = ({ children }) => {
  const githubAccessToken = useGithubAccessToken();

  const client = useMemo(() => getClient(githubAccessToken), [githubAccessToken]);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
