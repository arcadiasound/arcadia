import { styled } from "@stitches/react";
import { IconButton } from "@/ui/IconButton";

export const PlayButton = styled(IconButton, {
  "& svg": {
    transform: "translateX(1px)",
  },

  variants: {
    playing: {
      true: {
        "& svg": {
          transform: "translateX(0px)",
        },
      },
    },
    variant: {
      play: {
        color: "$slate1",
        backgroundColor: "$slate12",
        opacity: 0.9,
        br: 9999,

        "&:hover": {
          backgroundColor: "$slateSolidHover",
          opacity: 0.9,
        },

        "&:active": {
          transform: "scale(0.95)",
        },
      },
    },
  },

  defaultVariants: {
    variant: "play",
  },
});
