import type * as Stitches from "@stitches/react";
import { createStitches } from "@stitches/react";
import { slate, slateDark } from "./styles/colors/slate";
import { blue, blueDark } from "./styles/colors/blue";
import { green, greenDark } from "./styles/colors/green";
import { red, redDark } from "./styles/colors/red";
import { violet, violetDark } from "./styles/colors/violet";
import { yellow, yellowDark } from "./styles/colors/yellow";
import {
  blackA,
  neutralA,
  neutralADark,
  neutralInvertedA,
  neutralInvertedADark,
  whiteA,
} from "./styles/colors/alpha";

export const {
  styled,
  css,
  theme,
  globalCss,
  keyframes,
  getCssText,
  config,
  createTheme,
} = createStitches({
  theme: {
    colors: {
      ...slate,
      ...blue,
      ...green,
      ...red,
      ...violet,
      ...yellow,
      ...blackA,
      ...whiteA,
      ...neutralA,
      ...neutralInvertedA,

      focus: "$colors$blue8",
      slateSolidHover: "hsl(206, 6.0%, 15.0%)",
      slateSolidActive: "hsl(206, 6.0%, 24.0%)",
    },
    fonts: {
      heading: "Silka, 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      body: "Silka, 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    },
    space: {
      1: "4px",
      2: "8px",
      3: "12px",
      4: "16px",
      5: "20px",
      6: "24px",
      7: "28px",
      8: "32px",
      9: "36px",
      10: "40px",
      15: "60px",
      20: "80px",
    },
    sizes: {
      1: "4px",
      2: "8px",
      3: "12px",
      4: "16px",
      5: "20px",
      6: "24px",
      7: "28px",
      8: "32px",
      9: "36px",
      10: "40px",
      11: "44px",
    },
    fontSizes: {
      1: "13px",
      2: "15px",
      3: "16px",
      4: "21px",
      5: "24px",
      6: "30px",
      7: "36px",
      8: "48px",
      9: "72px",
    },
    radii: {
      1: "4px",
      2: "6px",
      3: "8px",
      4: "12px",
      round: "50%",
      pill: "9999px",
    },
    zIndices: {
      hide: -1,
      auto: "auto",
      base: 0,
      docked: 10,
      dropdown: 1000,
      sticky: 1100,
      banner: 1200,
      overlay: 1300,
      modal: 1400,
      popover: 1500,
      skipLink: 1600,
      toast: 1700,
      tooltip: 1800,
    },
  },
  media: {
    bp1: "(min-width: 520px)",
    bp2: "(min-width: 768px)",
    bp3: "(min-width: 1024px)",
    bp4: "(min-width: 1280px)",
    bp5: "(min-width: 1536px)",
    motionOK: "(prefers-reduced-motion: no-preference)",
    hover: "(any-hover: hover)",
    dark: "(prefers-color-scheme: dark)",
    light: "(prefers-color-scheme: light)",
  },
  utils: {
    p: (value: Stitches.PropertyValue<"padding">) => ({
      paddingTop: value,
      paddingBottom: value,
      paddingLeft: value,
      paddingRight: value,
    }),
    pt: (value: Stitches.PropertyValue<"padding">) => ({
      paddingTop: value,
    }),
    pr: (value: Stitches.PropertyValue<"padding">) => ({
      paddingRight: value,
    }),
    pb: (value: Stitches.PropertyValue<"padding">) => ({
      paddingBottom: value,
    }),
    pl: (value: Stitches.PropertyValue<"padding">) => ({
      paddingLeft: value,
    }),
    px: (value: Stitches.PropertyValue<"padding">) => ({
      paddingLeft: value,
      paddingRight: value,
    }),
    py: (value: Stitches.PropertyValue<"padding">) => ({
      paddingTop: value,
      paddingBottom: value,
    }),

    m: (value: Stitches.PropertyValue<"margin">) => ({
      marginTop: value,
      marginBottom: value,
      marginLeft: value,
      marginRight: value,
    }),
    mt: (value: Stitches.PropertyValue<"margin">) => ({
      marginTop: value,
    }),
    mr: (value: Stitches.PropertyValue<"margin">) => ({
      marginRight: value,
    }),
    mb: (value: Stitches.PropertyValue<"margin">) => ({
      marginBottom: value,
    }),
    ml: (value: Stitches.PropertyValue<"margin">) => ({
      marginLeft: value,
    }),
    mx: (value: Stitches.PropertyValue<"margin">) => ({
      marginLeft: value,
      marginRight: value,
    }),
    my: (value: Stitches.PropertyValue<"margin">) => ({
      marginTop: value,
      marginBottom: value,
    }),

    br: (value: Stitches.PropertyValue<"borderRadius">) => ({
      borderRadius: value,
    }),
    boxSize: (value: Stitches.PropertyValue<"width">) => ({
      width: value,
      height: value,
    }),
  },
});

export const darkTheme = createTheme("dark-theme", {
  colors: {
    ...slateDark,
    ...blueDark,
    ...greenDark,
    ...redDark,
    ...violetDark,
    ...yellowDark,
    ...blackA,
    ...whiteA,
    ...neutralADark,
    ...neutralInvertedADark,
    focus: "$colors$blue10",
    slateSolidHover: "hsl(206, 6.0%, 85.0%)",
    slateSolidActive: "hsl(206, 6.0%, 75.0%)",
  },
});

export type CSS = Stitches.CSS<typeof config>;
export type {
  ComponentProps,
  VariantProps,
  PropertyValue,
  ScaleValue,
} from "@stitches/react";
