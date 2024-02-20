import { styled } from "../stitches.config";

export const Textarea = styled("textarea", {
  appearance: "none",
  borderWidth: "0",
  boxSizing: "border-box",
  fontFamily: "inherit",
  margin: "0",
  outline: "none",
  padding: "0",
  width: "100%",
  backgroundColor: "transparent",
  WebkitTapHighlightColor: "rgba(0,0,0,0)",
  "&::before": {
    boxSizing: "border-box",
  },
  "&::after": {
    boxSizing: "border-box",
  },

  //custom
  px: "$2",
  br: "$3",
  color: "$slate12",
  boxShadow: "0 0 0 1px $colors$slate7",

  "&::placeholder": {
    color: "$slate9",
  },

  "&:focus": {
    boxShadow:
      "inset 0px 0px 0px 1px $colors$focus, 0px 0px 0px 1px $colors$focus",
  },

  "&:disabled": {
    pointerEvents: "none",
    cursor: "not-allowed",
    opacity: "50%",
  },

  '&[aria-disabled="true"]': {
    pointerEvents: "none",
    cursor: "not-allowed",
    opacity: "50%",
  },

  "&:read-only": {
    backgroundColor: "$slate3",
    boxShadow: "inset 0 0 0 1px $colors$slate7",
  },

  variants: {
    size: {
      1: {
        height: "$7",
        fontSize: "$1",
        lineHeight: "$sizes$7",
      },
      2: {
        height: "$10",
        fontSize: "$2",
        lineHeight: "$sizes$10",
      },
      3: {
        height: 80,
        fontSize: "$3",
        lineHeight: "$3",
      },
    },
    variant: {
      subtle: {
        backgroundColor: "$slate2",

        "&:hover": {
          backgroundColor: "$slate3",
        },
      },
      outline: {
        "&:hover": {
          boxShadow: "0 0 0 1px $colors$slate8",
        },
      },
    },
    state: {
      valid: {
        boxShadow: "inset 0 0 0 1px $colors$green7",

        "&:focus": {
          boxShadow:
            "inset 0px 0px 0px 1px $colors$green8, 0px 0px 0px 1px $colors$green8",
        },
      },
      invalid: {
        boxShadow: "inset 0 0 0 1px $colors$red7",

        "&:focus": {
          boxShadow:
            "inset 0px 0px 0px 1px $colors$red8, 0px 0px 0px 1px $colors$red8",
        },
      },
    },
  },

  defaultVariants: {
    size: "2",
    variant: "subtle",
  },
});
