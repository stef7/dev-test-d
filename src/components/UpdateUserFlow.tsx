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
} from "@chakra-ui/react";

import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useId, useState } from "react";
import { SteppedForm, SteppedFormProps } from "./SteppedForm";

type UserFormValues = { name: string; jobTitle: string };

type FormTextFieldProps = {
  label: string;
  required?: boolean;
  name: keyof UserFormValues;
} & Pick<InputProps, "type" | "value">;

const FormTextField: React.FC<FormTextFieldProps> = ({ label, type, value: valueInitial, required, name }) => {
  const id = useId();

  const [value, setValue] = useState(valueInitial);
  useEffect(() => setValue(valueInitial), [valueInitial]);
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

export const UpdateUserFlow: React.FC = () => {
  const { data: session, update } = useSession();

  const { isOpen, onOpen, onClose } = useDisclosure();

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

  return (
    <Stack spacing={4}>
      <Button colorScheme="teal" onClick={onOpen}>
        Update user
      </Button>

      <Modal {...{ isOpen, onClose }}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update user</ModalHeader>
          <ModalCloseButton />

          <SteppedForm {...{ onNextOrSubmit, StepContainer }} ButtonsContainer={ModalFooter}>
            <FormTextField name="name" label="Username" value={session?.user.name} required />
            <FormTextField name="jobTitle" label="Job title" value={session?.user.jobTitle} />
          </SteppedForm>
        </ModalContent>
      </Modal>
    </Stack>
  );
};
