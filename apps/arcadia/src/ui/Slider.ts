import * as Slider from "@radix-ui/react-slider";
import { styled } from "@/apps/arcadia/stitches.config";

export const SliderRoot = styled(Slider.Root, {
  position: "relative",
  display: "flex",
  alignItems: "center",
  userSelect: "none",
  touchAction: "none",
  width: 200,
  height: 20,
});

export const SliderTrack = styled(Slider.Track, {
  backgroundColor: "$neutralInvertedA7",
  position: "relative",
  flexGrow: 1,
  borderRadius: "9999px",
  height: 3,
});

export const SliderRange = styled(Slider.Range, {
  position: "absolute",
  backgroundColor: "$neutralInvertedA12",
  borderRadius: "9999px",
  height: "100%",
});

export const SliderThumb = styled(Slider.Thumb, {
  display: "block",
  width: 10,
  height: 10,
  backgroundColor: "$neutralInvertedA12",
  boxShadow: `0 2px 10px $colors$neutralInvertedA3`,
  borderRadius: 10,
  "&:focus": {
    outline: "none",
    boxShadow: `0 0 0 3px $colors$neutralInvertedA8`,
  },
});
