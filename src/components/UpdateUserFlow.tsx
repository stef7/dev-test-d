import {
  FormLabel,
  FormControl,
  Input,
  Button,
  InputProps,
  Stack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormErrorMessage,
  useDisclosure,
  Heading,
  Text,
} from "@chakra-ui/react";

import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { SteppedForm, SteppedFormProps } from "./SteppedForm";

type UserFormValues = { username: string; jobTitle: string };

type FormTextFieldProps = {
  label: string;
  required?: boolean;
  name: keyof UserFormValues;
  value: string | null;
} & Pick<InputProps, "type">;

const FormTextField: React.FC<FormTextFieldProps> = ({ label, type, value: valueInitial, required, name }) => {
  const id = useId();

  const [value, setValue] = useState(valueInitial ?? "");
  useEffect(() => setValue(valueInitial ?? ""), [valueInitial]);
  const [error, setError] = useState<string>();

  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={id}>{label}</FormLabel>
      <Input
        {...{ id, type, value, required, name }}
        onInput={(ev) => {
          setValue(ev.currentTarget.value);
          if (error) setError(ev.currentTarget.validationMessage);
        }}
        onInvalid={(ev) => {
          setError(ev.currentTarget.validationMessage);
          ev.preventDefault();
        }}
      />
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  );
};

const StepContainer: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <ModalBody>
      <Stack spacing={6}>{children}</Stack>
    </ModalBody>
  );
};

let welcomeOpenedAlready = false;

export const UpdateUserFlow: React.FC<{ welcomeIfNew?: boolean }> = ({ welcomeIfNew }) => {
  const { data: session, update } = useSession();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const launcherRef = useRef<HTMLButtonElement>(null);

  const onNextOrSubmit = useCallback<SteppedFormProps["onNextOrSubmit"]>(
    async (isSubmitting, event) => {
      if (isSubmitting) {
        await fetch("/api/user", {
          method: "POST",
          body: new URLSearchParams([...new FormData(event.currentTarget)] as [string, string][]),
        });
        await update();
        onClose();
      }
    },
    [update, onClose],
  );

  // if logged in, but no jobTitle set, this is a new user, so show modal as welcome screen
  const [welcomeOpened, setWelcomeOpened] = useState(welcomeOpenedAlready);
  const isNewUser = useMemo(() => session?.user && !session.user.jobTitle, [session]);
  useEffect(() => {
    if (!welcomeIfNew || welcomeOpened || !isNewUser) return;
    setWelcomeOpened((welcomeOpenedAlready = true));
    onOpen();
  }, [isNewUser, onOpen, welcomeIfNew, welcomeOpened]);

  if (!session?.user) return null;

  return (
    <Stack spacing={4}>
      <Heading>Hello, {session.user.name}!</Heading>
      {(session.user.username || session.user.jobTitle) && (
        <Text>{[session.user.username, session.user.jobTitle].filter(Boolean).join(", ")}</Text>
      )}

      <Button colorScheme="teal" onClick={onOpen} ref={launcherRef}>
        Edit your details
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} finalFocusRef={launcherRef}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isNewUser ? "Welcome! Please enter your details." : "Edit your details"}</ModalHeader>
          <ModalCloseButton />

          <SteppedForm {...{ onNextOrSubmit, StepContainer, ButtonsContainer: ModalFooter }}>
            <FormTextField name="username" label="Username" value={session.user.username} required />
            <FormTextField name="jobTitle" label="Job title" value={session.user.jobTitle} required />
          </SteppedForm>
        </ModalContent>
      </Modal>
    </Stack>
  );
};
