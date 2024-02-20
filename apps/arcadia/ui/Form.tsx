import { CSS, styled } from "@/apps/arcadia/stitches.config";
import { Flex } from "./Flex";
import { Typography } from "./Typography";

const FormHelperErrorText = styled("p", {
  fontSize: "$1",
  lineHeight: "$2",
  color: "$red11",
  m: 0,
  mt: "$1",
  position: "absolute",
  bottom: 0,
});

export const FormHelperError = ({
  children,
  css,
}: {
  children: React.ReactNode;
  css?: CSS;
}) => (
  <FormHelperErrorText css={css} role="alert" aria-live="polite">
    {children}
  </FormHelperErrorText>
);

export const FormHelperText = styled(Typography, {
  fontSize: "$1",
  lineHeight: "$2",
  m: 0,
  mt: "$1",
  position: "absolute",
  bottom: 0,

  defaultVariants: {
    size: "1",
  },
});

export const FormRow = styled(Flex, {
  gap: "$2",
  pb: "$7",
  position: "relative",

  defaultVariants: {
    direction: "column",
  },

  "& span": {
    color: "$slate12",
  },
});
