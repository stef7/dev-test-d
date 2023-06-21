import { gql, useQuery } from "@apollo/client";

import { useSession, signIn, signOut } from "next-auth/react";

import { Button, Container, Heading, Link, Stack, UnorderedList, ListItem, Text } from "@chakra-ui/react";

import { NextPage } from "next";
import React from "react";

const QUERY = gql`
  query {
    viewer {
      login
      repositories(
        affiliations: OWNER
        first: 100
        orderBy: {field: UPDATED_AT, direction: DESC}
      ) {
        edges {
          node {
            id
            name
            url
          }
        }
      }
    }
  }
`;

const Home: NextPage = () => {
  const { data: session } = useSession();

  const { data, error } = useQuery(QUERY);
  const repos = data?.viewer.repositories.edges as undefined | { node: { id: string; name: string; url: string } }[];

  return (
    <main>
      <Container padding={8}>
        <Stack spacing={4}>
          {session ? (
            <>
              <Heading>Repositories you own</Heading>
              {repos?.length ? (
                <UnorderedList fontSize="lg">
                  {repos.map(({ node: repo }) => (
                    <ListItem key={repo.id}>
                      <Link textDecoration="underline" color="teal.500" href={repo.url} isExternal>
                        {repo.name}
                      </Link>
                    </ListItem>
                  ))}
                </UnorderedList>
              ) : (
                <Text>{repos ? "None" : error ? "Failed to load items." : "Loading..."}</Text>
              )}
              <Button onClick={() => signOut()}>Sign out</Button>
            </>
          ) : (
            <>
              <Button onClick={() => signIn("github")}>Sign in with GitHub</Button>
            </>
          )}
        </Stack>
      </Container>
    </main>
  );
};
export default Home;
