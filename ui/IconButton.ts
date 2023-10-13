import { styled } from "@/stitches.config";

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

  '&[aria-disabled="true"]': {
    pointerEvents: "none",
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
        color: "$$color",
        backgroundColor: "$$bgSubtle",

        "&:hover": {
          backgroundColor: "$$bgSubtleHover",
        },

        "&:active": {
          backgroundColor: "$$bgSubtleActive",
        },

        "&:focus-visible": {
          boxShadow: "0 0 0 2px $$focus",
        },
      },
      outline: {
        color: "$$color",
        backgroundColor: "transparent",
        boxShadow: "inset 0 0 0 1px $$border",

        "&:hover": {
          boxShadow: "inset 0 0 0 1px $$borderHover",
        },

        "&:active": {
          backgroundColor: "$$bgActive",
          boxShadow: "inset 0 0 0 1px $$borderActive",
        },

        "&:focus-visible": {
          boxShadow: "0 0 0 2px $$focus",
        },
      },
      solid: {
        backgroundColor: "$$bgSolid",
        color: "$$colorSolid",

        "&:hover": {
          backgroundColor: "$$bgSolidHover",
        },

        "&:active": {
          backgroundColor: "$$bgSolidActive",
        },

        "&:focus-visible": {
          boxShadow: "0 0 0 2px $colors$blue8",
        },
      },
      ghost: {
        color: "$$color",
        backgroundColor: "transparent",

        "&:hover": {
          backgroundColor: "$$bgHover",
        },

        "&:active": {
          backgroundColor: "$$bgActive",
        },

        "&:focus-visible": {
          boxShadow: "0 0 0 2px $$focus",
        },
      },
    },
    border: {
      true: {},
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
  ],

  defaultVariants: {
    size: "2",
    variant: "subtle",
  },
});
