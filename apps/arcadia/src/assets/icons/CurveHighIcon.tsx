import { IconProps } from "@radix-ui/react-icons/dist/types";
import * as React from "react";

const CurveHighIcon = ({ width = 4.1, height = 18, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox={`0 0 5 18`}
    {...props}
    fill="none"
  >
    <path
      d="M0.48256 17.4425C0.869279 17.6974 1.38783 17.5831 1.66908 17.1612C3.21596 14.8409 4.1476 11.9581 4.1476 8.79404C4.1476 5.62118 3.19838 2.74716 1.66908 0.418059C1.38783 -0.0126051 0.869279 -0.118074 0.48256 0.136809C0.0606854 0.40927 -0.000838012 0.927825 0.289201 1.39364C1.63393 3.4415 2.46889 5.98154 2.46889 8.79404C2.46889 11.589 1.63393 14.1466 0.289201 16.1856C-0.000838012 16.6515 0.0606854 17.17 0.48256 17.4425Z"
      fill="currentColor"
    />
  </svg>
);
export default CurveHighIcon;
