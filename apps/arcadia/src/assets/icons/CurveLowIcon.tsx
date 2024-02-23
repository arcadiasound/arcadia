import { IconProps } from "@radix-ui/react-icons/dist/types";
import * as React from "react";

const CurveLowIcon = ({ width = 2.1, height = 9, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox={`0 0 3 9`}
    {...props}
    fill="none"
  >
    <path
      d="M0.380841 8.70504C0.758771 8.95113 1.25096 8.86324 1.52342 8.47652C2.23533 7.5273 2.65721 6.18258 2.65721 4.78511C2.65721 3.38765 2.23533 2.05172 1.52342 1.09371C1.25096 0.70699 0.758771 0.619099 0.380841 0.873982C-0.049823 1.15523 -0.128925 1.67379 0.213849 2.18355C0.697247 2.87789 0.969708 3.80953 0.969708 4.78511C0.969708 5.7607 0.697247 6.68355 0.213849 7.38668C-0.128925 7.89644 -0.049823 8.415 0.380841 8.70504Z"
      fill="currentColor"
    />
  </svg>
);
export default CurveLowIcon;
