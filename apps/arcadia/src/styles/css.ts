import { createHooks } from "@css-hooks/react";
import { recommended } from "@css-hooks/recommended";

export const [hooks, css] = createHooks({
  ...recommended({
    breakpoints: ["500px", "1000px"],
    colorSchemes: ["dark", "light"],
    pseudoClasses: [":hover", ":focus", ":active", ":disabled"],
  }),
  "&:showOverlay": {
    or: [
      ":hover",
      {
        // need to find a way to target focus visible on button
        and: [":focus-within", ":focus-visible"],
      },
    ],
  },
  "&:notDisabeld": "&:not(:disabled)",
});
