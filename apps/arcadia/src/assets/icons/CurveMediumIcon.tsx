import { IconProps } from "@radix-ui/react-icons/dist/types";
import * as React from "react";

const CurveMediumIcon = ({ width = 3.1, height = 14, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox={`0 0 4 14`}
    {...props}
  >
    <path
      d="M0.922639 13.0602C1.32694 13.3063 1.81912 13.2184 2.10037 12.8054C3.24295 11.1882 3.91092 9.01727 3.91092 6.78485C3.91092 4.55242 3.25174 2.37274 2.10037 0.764338C1.81912 0.351252 1.32694 0.254572 0.922639 0.509455C0.500764 0.773127 0.43924 1.30047 0.755646 1.76629C1.68729 3.13738 2.22342 4.92156 2.22342 6.78485C2.22342 8.63934 1.6785 10.4235 0.755646 11.8034C0.448029 12.2692 0.500764 12.7878 0.922639 13.0602Z"
      fill="currentColor"
    />
  </svg>
);
export default CurveMediumIcon;
