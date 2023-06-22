import { useForm } from "react-hook-form";
import {
  FormErrorMessage,
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
} from "@chakra-ui/react";

import { useSession } from "next-auth/react";
import React, { useCallback, useId, useMemo, useState } from "react";

type UserFormValues = { name: string; jobTitle: string };
const useUserForm = () => useForm<UserFormValues>();
type FormReturn = ReturnType<typeof useUserForm>;

type FormTextFieldProps = {
  formReturn: FormReturn;
  label: string;
  required?: boolean;
  fieldName: keyof UserFormValues;
} & Pick<InputProps, "type" | "value">;
const FormTextField: React.FC<FormTextFieldProps> = ({ formReturn, label, type, value, required, fieldName }) => {
  const id = useId();

  const {
    register,
    formState: { errors },
  } = formReturn;

  const fieldError = errors[fieldName];

  return (
    <FormControl isInvalid={!!fieldError}>
      <FormLabel htmlFor={id}>{label}</FormLabel>
      <Input
        {...{ id, type, defaultValue: value }}
        {...register(fieldName, {
          required: required ? `${label} is required` : undefined,
        })}
      />
      <FormErrorMessage>{fieldError?.message}</FormErrorMessage>
    </FormControl>
  );
};

export const UpdateUserFlow: React.FC = () => {
  const { data: session, update } = useSession();

  const formReturn = useUserForm();
  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    reset,
  } = formReturn;

  const [step, setStep] = useState<number>();
  const steps = useMemo(
    () =>
      session
        ? [
            () => (
              <FormTextField {...{ formReturn }} fieldName="name" label="Username" value={session.user.name} required />
            ),
            () => (
              <FormTextField {...{ formReturn }} fieldName="jobTitle" label="Job title" value={session.user.jobTitle} />
            ),
          ]
        : [],
    [formReturn, session],
  );

  const close = useCallback(() => setStep(undefined), []);
  const next = useCallback(
    () => setStep(!step ? 1 : step >= steps.length ? undefined : step + 1),
    [step, steps.length],
  );
  const previous = useCallback(() => setStep(!step || step <= 1 ? undefined : step - 1), [step]);

  const onValid = useCallback<Parameters<FormReturn["handleSubmit"]>[0]>(
    async (values) => {
      if (step !== steps.length) {
        next();
        return;
      }

      await fetch("/api/user", {
        method: "POST",
        body: JSON.stringify(values),
      });
      await update();
      close();
    },
    [update, close, next, step, steps.length],
  );

  return (
    <Stack spacing={4}>
      <Button
        colorScheme="teal"
        onClick={() => {
          reset();
          next();
        }}
      >
        Update user
      </Button>
      <Modal isOpen={!!step} onClose={close}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit(onValid)}>
            <ModalHeader>Update user</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack spacing={4}>
                {steps.map((stepRender, stepIndex0) => (
                  <Stack
                    key={`${stepRender} ${stepIndex0}`}
                    spacing={4}
                    display={step === stepIndex0 + 1 ? undefined : "none"}
                  >
                    {stepRender()}
                  </Stack>
                ))}
                <FormErrorMessage>{errors.root?.message}</FormErrorMessage>
              </Stack>
            </ModalBody>
            <ModalFooter>
              {step !== 1 && (
                <Button colorScheme="gray" type="button" onClick={previous} mr="auto" disabled={isSubmitting}>
                  Back
                </Button>
              )}
              <Button colorScheme="teal" isLoading={isSubmitting} type="submit">
                {step === steps.length ? "Submit" : "Next"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Stack>
  );
};
