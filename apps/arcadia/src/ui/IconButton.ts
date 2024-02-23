import { styled, ComponentProps } from "@/apps/arcadia/stitches.config";

export type IconButtonVariants = ComponentProps<typeof IconButton>;

export const IconButton = styled("button", {
  // Reset
  alignItems: "center",
  justifyContent: "center",
  appearance: "none",
  borderWidth: 0,
  boxSizing: "border-box",
  flexShrink: 0,
  outline: "none",
  padding: 0,
  textDecoration: "none",
  userSelect: "none",

  // custom reset
  display: "inline-flex",
  WebkitTapHighlightColor: "transparent",
  lineHeight: 1,

  //custom
  fontFamily: "inherit",
  br: "$2",

  "&:focus-visible": {
    boxShadow: "0 0 0 2px $colors$focus",
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

  variants: {
    size: {
      1: {
        width: "$7",
        height: "$7",
        fontSize: "$1",
        "& svg": {
          size: "$3",
        },
      },
      2: {
        width: "$9",
        height: "$9",
        fontSize: "$3",
        "& svg": {
          size: "$4",
        },
      },
      3: {
        width: "$11",
        height: "$11",
        fontSize: "$5",
        "& svg": {
          size: "$4",
        },
      },
    },
    variant: {
      subtle: {
        color: "$slate11",
        backgroundColor: "$slate3",

        "&:hover": {
          backgroundColor: "$slate4",
        },

        "&:active": {
          backgroundColor: "$slate5",
        },
      },
      solid: {
        backgroundColor: "$slate12",
        color: "$slate1",

        "&:hover": {
          backgroundColor: "$slateSolidHover",
        },

        "&:active": {
          backgroundColor: "$slateSolidHover",
        },

        "&:focus-visible": {
          boxShadow: "0 0 0 2px $colors$focus",
        },
      },
      ghost: {
        color: "$slate11",
        backgroundColor: "transparent",

        "&:hover": {
          backgroundColor: "$slate4",
        },

        "&:active": {
          backgroundColor: "$slate5",
        },
      },
      transparent: {
        backgroundColor: "transparent",
        color: "$slate11",

        "&:hover": {
          color: "$slate12",
        },
      },
      translucent: {
        backgroundColor: "$whiteA3",
        color: "$whiteA11",

        "&:hover": {
          backgroundColor: "$whiteA4",
          color: "$whiteA12",
        },

        "&:active": {
          backgroundColor: "$whiteA5",
        },
      },
    },

    border: {
      true: {},
    },
    rounded: {
      true: {
        br: "$round",
      },
    },
  },
  compoundVariants: [
    {
      variant: "subtle",
      border: true,
      css: {
        backgroundColor: "$$bg",
        boxShadow: "inset 0 0 0 1px $$border",
        "&:hover": {
          backgroundColor: "$$bgHover",
          boxShadow: "inset 0 0 0 1px $$borderHover",
        },
        "&:active": {
          backgroundColor: "$$bgActive",
          boxShadow: "inset 0 0 0 1px $$borderActive",
        },
      },
    },
    {
      variant: "transparent",
      size: "1",
      css: {
        width: "$4",
        height: "$4",
      },
    },
    {
      variant: "transparent",
      size: "2",
      css: {
        width: "$6",
        height: "$6",
      },
    },
    {
      variant: "transparent",
      size: "3",
      css: {
        width: "$8",
        height: "$8",
      },
    },
  ],

  defaultVariants: {
    size: "2",
    variant: "subtle",
  },
});
