import { IconProps } from "@radix-ui/react-icons/dist/types";
import { styled, keyframes } from "@stitches/react";
import * as React from "react";

// Define the animation using keyframes
const drawLine = keyframes({
  "0%": { strokeDasharray: "0, 100%" },
  "100%": { strokeDasharray: "100%, 0" },
});

// Create a styled line with the animation
const AnimatedLine = styled("line", {
  animation: `${drawLine} 2s linear`,
});

const LineIcon = ({ width = 15, height = 15, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    {...props}
    fill="none"
    viewBox={`0 0 ${width} ${height}`}
  >
    <AnimatedLine
      x1="0"
      y1="0"
      x2={width}
      y2={height}
      stroke="currentColor"
      strokeWidth="1"
    />
  </svg>
);

export default LineIcon;
