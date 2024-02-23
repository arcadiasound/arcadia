import { styled } from "@/apps/arcadia/stitches.config";

export const Image = styled("img", {
  userSelect: "none",
  variants: {
    size: {
      1: {
        width: 16,
        height: 16,
      },
      2: {
        width: 20,
        height: 20,
      },
      3: {
        width: 28,
        height: 28,
      },
    },
    fit: {
      cover: {
        objectFit: "cover",
      },
      contain: {
        objectFit: "contain",
      },
    },
  },

  defaultVariants: {
    fit: "cover",
  },
});
