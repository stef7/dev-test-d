import { useMemo } from "react";
import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { GraphQLError } from "graphql";
import { useSession } from "next-auth/react";

const httpLink = new HttpLink({
  uri: "https://api.github.com/graphql",
});

export const ApolloProviderWrapper: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { data: session } = useSession();

  const client = useMemo(() => {
    // const authMiddleware = setContext(async (_operation, { headers }) => {
    //   if (!session?.user?.username) throw new GraphQLError("User is not authenticated");

    //   return {
    //     headers: {
    //       ...headers,
    //       authorization: `Bearer ${session.accessToken}`,
    //     },
    //   };
    // });

    return new ApolloClient({
      // link: from([authMiddleware, httpLink]),
      link: from([httpLink]),
      cache: new InMemoryCache(),
    });
    // }, [session]);
  }, []);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
