import { useForm } from "react-hook-form";
import { FormErrorMessage, FormLabel, FormControl, Input, Button, InputProps, Stack } from "@chakra-ui/react";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useId } from "react";
import type { UserResponseBody } from "~/pages/api/user";

type UserFormValues = { name: string; jobTitle: string };
const useUserForm = () => useForm<UserFormValues>();
type FormReturn = ReturnType<typeof useUserForm>;
type OnValid = Parameters<FormReturn["handleSubmit"]>[0];

type TextFieldProps = {
  formReturn: FormReturn;
  label: string;
  required?: boolean;
  fieldName: keyof UserFormValues;
} & Pick<InputProps, "type" | "value">;

const FormTextField: React.FC<TextFieldProps> = ({ formReturn, label, type, value, required, fieldName }) => {
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
        {...{ id, type }}
        {...register(fieldName, {
          required: required ? `${label} is required` : undefined,
        })}
        defaultValue={value}
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
    formState: { isSubmitting },
  } = formReturn;

  const onValid = useCallback<OnValid>(
    async (values) => {
      const response: UserResponseBody = await fetch(`/api/user`, {
        method: "POST",
        body: JSON.stringify(values),
      }).then((r) => r.json());

      if ("error" in response) throw new Error(response.error);

      update();
    },
    [update],
  );

  if (!session) return null;

  return (
    <form onSubmit={handleSubmit(onValid)}>
      <Stack spacing={4}>
        <FormTextField
          {...{ formReturn, fieldName: "name", required: true, label: "Username", value: session.user.name }}
        />
        <FormTextField
          {...{ formReturn, fieldName: "jobTitle", required: true, label: "Job title", value: session.user.jobTitle }}
        />
        <Button colorScheme="teal" isLoading={isSubmitting} type="submit">
          Submit
        </Button>
      </Stack>
    </form>
  );
};
