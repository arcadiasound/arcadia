import { darkTheme, keyframes, styled } from "../stitches.config";

const loading = keyframes({
  "0%": { backgroundPosition: "200% 0" },
  "100%": { backgroundPosition: "-200% 0" },
});

export const Skeleton = styled("div", {
  width: 100,
  height: 100,
  br: "$1",
  backgroundImage:
    "linear-gradient(270deg, hsl(109, 0%, 94%), hsl(109, 0%, 91%), hsl(109, 0%, 91%), hsl(109, 0%, 94%))",
  backgroundSize: "400% 100%",
  animation: `${loading} 5s ease-in-out infinite`,

  [`.${darkTheme} &`]: {
    backgroundImage:
      "linear-gradient(270deg, hsl(109, 0%, 6%), hsl(109, 0%, 9%), hsl(109, 0%, 9%), hsl(109, 0%, 6%))",
  },
});
