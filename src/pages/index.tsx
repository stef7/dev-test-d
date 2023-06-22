import { useSession, signIn, signOut } from "next-auth/react";

import { Button, Container, Stack, useColorMode } from "@chakra-ui/react";

import type { NextPage } from "next";
import React from "react";
import { RepositoryList } from "~/components/RepositoryList";
import { UpdateUserFlow } from "~/components/UpdateUserFlow";

const Home: NextPage = () => {
  const { data: session } = useSession();
  const { toggleColorMode } = useColorMode();

  return (
    <main>
      <Container padding={8}>
        <Stack spacing={6}>
          {session ? (
            <>
              <Button onClick={() => signOut()}>Sign out</Button>
              <UpdateUserFlow />
              <RepositoryList />
            </>
          ) : (
            <>
              <Button onClick={() => signIn("github")}>Sign in with GitHub</Button>
            </>
          )}
          <Button size="sm" colorScheme="blue" onClick={toggleColorMode}>
            Toggle colour mode
          </Button>
        </Stack>
      </Container>
    </main>
  );
};
export default Home;
