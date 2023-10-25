import { styled } from "@/stitches.config";

export const Image = styled("img", {
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
  },
});
