import { ComponentProps, styled } from "@/stitches.config";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

export type AvatarProps = ComponentProps<typeof Avatar>;

export const Avatar = styled(AvatarPrimitive.Root, {
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  verticalAlign: "middle",
  overflow: "hidden",
  userSelect: "none",

  variants: {
    size: {
      1: {
        size: "$5",
        '& span[data-avatar="fallback"]': {
          fontSize: "$1",
          lineHeight: "$1",
        },
      },
      2: {
        size: "$6",
        '& span[data-avatar="fallback"]': {
          fontSize: "$1",
          lineHeight: "$1",
        },
      },
      3: {
        size: "$7",
        '& span[data-avatar="fallback"]': {
          fontSize: "$2",
          lineHeight: "$2",
        },
      },
      4: {
        size: "$10",
        '& span[data-avatar="fallback"]': {
          fontSize: "$2",
          lineHeight: "$2",
        },
      },
      5: {
        size: "$16",
        '& span[data-avatar="fallback"]': {
          fontSize: "$5",
          lineHeight: "$5",
        },
      },
      6: {
        size: "$20",
        '& span[data-avatar="fallback"]': {
          fontSize: "$6",
          lineHeight: "$6",
        },
      },
      7: {
        size: 96,
        '& span[data-avatar="fallback"]': {
          fontSize: "$7",
          lineHeight: "$7",
        },
      },
    },
    shape: {
      round: {
        br: "$round",
      },
      square: {
        br: 0,
      },
    },
  },

  defaultVariants: {
    size: "4",
    shape: "round",
  },
});

export const AvatarImage = styled(AvatarPrimitive.Image, {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  borderRadius: "inherit",
});

export const AvatarFallback = styled(AvatarPrimitive.Fallback, {
  userSelect: "none",
  width: "100%",
  height: "100%",
  fontFamily: "inherit",
});
