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
        width: "$6",
        height: "$6",
        '& span[data-avatar="fallback"]': {
          fontSize: "$1",
          lineHeight: "$1",
        },
      },
      2: {
        width: "$7",
        height: "$7",
        '& span[data-avatar="fallback"]': {
          fontSize: "$1",
          lineHeight: "$1",
        },
      },
      3: {
        width: "$8",
        height: "$8",
        '& span[data-avatar="fallback"]': {
          fontSize: "$2",
          lineHeight: "$2",
        },
      },
      4: {
        width: "$10",
        height: "$10",
        '& span[data-avatar="fallback"]': {
          fontSize: "$2",
          lineHeight: "$2",
        },
      },
      5: {
        width: "$16",
        height: "$16",
        '& span[data-avatar="fallback"]': {
          fontSize: "$5",
          lineHeight: "$5",
        },
      },
      6: {
        width: "$20",
        height: "$20",
        '& span[data-avatar="fallback"]': {
          fontSize: "$6",
          lineHeight: "$6",
        },
      },
      7: {
        width: 96,
        height: 96,
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
