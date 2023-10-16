import { keyframes, styled } from "@/stitches.config";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

const slideUpAndFade = keyframes({
  "0%": { opacity: 0, transform: "translateY(2px)" },
  "100%": { opacity: 1, transform: "translateY(0)" },
});

const slideRightAndFade = keyframes({
  "0%": { opacity: 0, transform: "translateX(-2px)" },
  "100%": { opacity: 1, transform: "translateX(0)" },
});

const slideDownAndFade = keyframes({
  "0%": { opacity: 0, transform: "translateY(-2px)" },
  "100%": { opacity: 1, transform: "translateY(0)" },
});

const slideLeftAndFade = keyframes({
  "0%": { opacity: 0, transform: "translateX(2px)" },
  "100%": { opacity: 1, transform: "translateX(0)" },
});

const contentStyles = {
  minWidth: 220,
  backgroundColor: "$slate2",
  borderRadius: "$1",
  padding: 5,
  boxShadow:
    "0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2)",
  animationDuration: "400ms",
  animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
  willChange: "transform, opacity",
  '&[data-state="open"]': {
    '&[data-side="top"]': { animationName: slideDownAndFade },
    '&[data-side="right"]': { animationName: slideLeftAndFade },
    '&[data-side="bottom"]': { animationName: slideUpAndFade },
    '&[data-side="left"]': { animationName: slideRightAndFade },
  },
};

export const DropdownMenuContent = styled(DropdownMenu.Content, contentStyles);
export const DropdownMenuSubContent = styled(
  DropdownMenu.SubContent,
  contentStyles
);

export const DropdownMenuArrow = styled(DropdownMenu.Arrow, { fill: "white" });

export const itemStyles = {
  all: "unset",
  fontSize: 13,
  lineHeight: 1,
  color: "$slate11",
  borderRadius: 3,
  display: "flex",
  alignItems: "center",
  height: 25,
  padding: "0 5px",
  position: "relative",
  paddingLeft: 25,
  userSelect: "none",

  "&[data-disabled]": {
    color: "$slate8",
    pointerEvents: "none",
  },

  "&[data-highlighted]": {
    backgroundColor: "$slate4",
    color: "$slate12",
  },
};

export const DropdownMenuItem = styled(DropdownMenu.Item, itemStyles);
export const DropdownMenuCheckboxItem = styled(
  DropdownMenu.CheckboxItem,
  itemStyles
);
export const DropdownMenuRadioItem = styled(DropdownMenu.RadioItem, itemStyles);
export const DropdownMenuSubTrigger = styled(DropdownMenu.SubTrigger, {
  '&[data-state="open"]': {
    backgroundColor: "$slate4",
    color: "$slate11",
  },
  ...itemStyles,
});

export const DropdownMenuLabel = styled(DropdownMenu.Label, {
  paddingLeft: 25,
  fontSize: 12,
  lineHeight: "25px",
  color: "$slate11",
});

export const DropdownMenuSeparator = styled(DropdownMenu.Separator, {
  height: 1,
  backgroundColor: "$slate6",
  margin: 5,
});

export const DropdownMenuItemIndicator = styled(DropdownMenu.ItemIndicator, {
  position: "absolute",
  left: 0,
  width: 25,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
});

export const RightSlot = styled("div", {
  marginLeft: "auto",
  paddingLeft: 20,
  color: "$slate11",
  "[data-highlighted] > &": { color: "white" },
  "[data-disabled] &": { color: "$slate8" },
});

export const DropdownMenuRoot = styled(DropdownMenu.Root);
export const DropdownMenuSubRoot = styled(DropdownMenu.Sub);
export const DropdownMenuPortal = styled(DropdownMenu.Portal);
export const DropdownMenuTrigger = styled(DropdownMenu.Trigger);
