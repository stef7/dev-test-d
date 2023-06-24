import { useSession, signIn, signOut } from "next-auth/react";

import { Button, Container, Stack, useColorMode } from "@chakra-ui/react";

import type { NextPage } from "next";
import React, { useState } from "react";
import { RepositoryList } from "~/components/RepositoryList";
import { UpdateUserFlow } from "~/components/UpdateUserFlow";

const Home: NextPage = () => {
  const { data: session } = useSession();
  const { toggleColorMode } = useColorMode();
  const [loadingAuthChange, setLoadingAuthChange] = useState(false);

  return (
    <main>
      <Container padding={12} maxW="container.lg">
        <Stack spacing={12}>
          {session ? (
            <>
              <Button
                isLoading={loadingAuthChange}
                onClick={() => {
                  setLoadingAuthChange(true);
                  signOut();
                }}
              >
                Sign out
              </Button>
              <UpdateUserFlow welcomeIfNew />
              <RepositoryList />
            </>
          ) : (
            <Button
              isLoading={session === undefined || loadingAuthChange}
              onClick={() => {
                setLoadingAuthChange(true);
                signIn("github");
              }}
            >
              Sign in with GitHub
            </Button>
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
