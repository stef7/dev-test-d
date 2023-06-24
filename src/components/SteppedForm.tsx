import { Button, Flex } from "@chakra-ui/react";
import React, { Children, PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Constraint_validation#constraint_validation_process
 */
type Checkable = Extract<
  HTMLInputElement | HTMLSelectElement | HTMLButtonElement | HTMLOutputElement | HTMLTextAreaElement,
  { checkValidity: () => boolean }
>;
const checkableSelector = "input, select, textarea, button, output";

type ContainerFC = React.FC<PropsWithChildren<Record<string, any>>>;

export type SteppedFormProps = {
  Container?: ContainerFC;
  StepContainer?: ContainerFC;
  ButtonsContainer?: ContainerFC;

  children: React.ReactElement[];

  onNextOrSubmit: (
    isSubmitting: boolean,
    ...a: Parameters<NonNullable<JSX.IntrinsicElements["form"]["onSubmit"]>>
  ) => void | Promise<void>;
};

export const SteppedForm: React.FC<SteppedFormProps> = ({
  StepContainer = React.Fragment,
  ButtonsContainer = Flex,
  children,
  onNextOrSubmit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const stepsParent = useRef<HTMLOListElement>(null);
  const [stepFields, setStepFields] = useState<Checkable[]>([]);
  // on step transition, focus first field of step
  useEffect(() => {
    const nodes = stepsParent.current?.children[currentIndex]?.querySelectorAll<Checkable>(checkableSelector);
    if (!nodes?.length) return;
    setStepFields([...nodes]);
    nodes[0]!.focus();
  }, [currentIndex]);

  const [isProgressing, setIsProgressing] = useState(false);

  const goBack = useCallback(() => setCurrentIndex(currentIndex - 1), [currentIndex]);
  const goNextOrSubmit = useCallback<NonNullable<React.DOMAttributes<HTMLFormElement>["onSubmit"]>>(
    async (event) => {
      event.preventDefault();

      for (const field of stepFields) if (!field.checkValidity()) return field.focus();

      setIsProgressing(true);
      const lastStep = currentIndex >= children.length - 1;
      try {
        await onNextOrSubmit(lastStep, event);
        setCurrentIndex(lastStep ? 0 : currentIndex + 1);
      } finally {
        setIsProgressing(false);
      }
    },
    [children.length, currentIndex, onNextOrSubmit, stepFields],
  );

  return (
    <form onSubmit={goNextOrSubmit} style={{ display: "contents" }} noValidate>
      <ol ref={stepsParent} style={{ display: "contents" }}>
        {Children.map(children, (child, childIndex) => (
          <li key={child.key} style={{ display: currentIndex !== childIndex ? "none" : "contents" }}>
            <StepContainer>{child}</StepContainer>

            <ButtonsContainer>
              {childIndex > 0 && (
                <Button type="button" colorScheme="gray" mr="auto" isDisabled={isProgressing} onClick={goBack}>
                  Back
                </Button>
              )}

              <Button
                type="submit"
                colorScheme={childIndex < children.length - 1 ? "gray" : "teal"}
                isLoading={isProgressing}
              >
                {childIndex < children.length - 1 ? "Next" : "Submit"}
              </Button>
            </ButtonsContainer>
          </li>
        ))}
      </ol>
    </form>
  );
};
