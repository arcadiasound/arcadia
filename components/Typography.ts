import { styled } from "../stitches.config";
import { ComponentProps } from "@stitches/react";

export type TypographyProps = ComponentProps<typeof Typography>;

export const Typography = styled("p", {
  // resets
  margin: 0,
  fontVariantNumeric: "tabular-nums",

  // custom
  fontFamily: "inherit",
  $$loColor: "$colors$slate11",
  $$hiColor: "$colors$slate12",

  variants: {
    size: {
      1: {
        fontSize: "$1",
        lineHeight: "$1",
      },
      2: {
        fontSize: "$2",
        lineHeight: "$2",
      },
      3: {
        fontSize: "$3",
        lineHeight: "$3",
      },
      4: {
        fontSize: "$4",
        lineHeight: "$4",
      },
      5: {
        fontSize: "$5",
        lineHeight: "$5",
      },
      6: {
        fontSize: "$6",
        lineHeight: "$6",
      },
      7: {
        fontSize: "$7",
        lineHeight: "$7",
      },
      8: {
        fontSize: "$8",
        lineHeight: "$8",
      },
      9: {
        fontSize: "$9",
        lineHeight: "$9",
      },
      10: {
        fontSize: "$10",
        lineHeight: "$10",
      },
      11: {
        fontSize: "$11",
        lineHeight: "$11",
      },
      12: {
        fontSize: "$12",
        lineHeight: "$12",
      },
    },
    weight: {
      1: {
        fontWeight: "$1",
      },
      2: {
        fontWeight: "$2",
      },
      3: {
        fontWeight: "$3",
      },
      4: {
        fontWeight: "$4",
      },
      5: {
        fontWeight: "$5",
      },
      6: {
        fontWeight: "$6",
      },
      7: {
        fontWeight: "$7",
      },
      8: {
        fontWeight: "$8",
      },
      9: {
        fontWeight: "$9",
      },
    },
    contrast: {
      lo: {
        color: "$$loColor",
      },
      hi: {
        color: "$$hiColor",
      },
    },
    ellipsis: {
      single: {
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        overflow: "hidden",
      },
      multi: {
        textOverflow: "ellipsis",
        overflow: "hidden",
        display: "-webkit-box",
        "-webkit-line-clamp": 2,
        "-webkit-box-orient": "vertical",
      },
    },
  },

  defaultVariants: {
    size: "3",
    weight: "4",
    contrast: "lo",
  },
});
