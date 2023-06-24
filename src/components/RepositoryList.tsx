import { gql, useQuery } from "@apollo/client";

import { Heading, Link, UnorderedList, ListItem, Text, Stack, Spinner } from "@chakra-ui/react";

const QUERY_REPOSITORIES = gql`
  query OwnedRepositories {
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

export const RepositoryList: React.FC = () => {
  const { data, error } = useQuery(QUERY_REPOSITORIES);
  const repos = data?.viewer.repositories.edges as undefined | { node: { id: string; name: string; url: string } }[];

  return (
    <Stack spacing={4}>
      <Heading>Repositories you own</Heading>
      {repos?.length ? (
        <UnorderedList fontSize="lg" style={{ columns: "14rem auto" }}>
          {repos.map(({ node: repo }) => (
            <ListItem key={repo.id}>
              <Link textDecoration="underline" color="teal.500" href={repo.url} isExternal>
                {repo.name}
              </Link>
            </ListItem>
          ))}
        </UnorderedList>
      ) : (
        <Text>
          {repos ? (
            "You don't own any repositories."
          ) : error ? (
            "Failed to load items."
          ) : (
            <>
              <Spinner />
              {" Loading..."}
            </>
          )}
        </Text>
      )}
    </Stack>
  );
};
