import { styled } from "@/stitches.config";
import * as TabsPrimitive from "@radix-ui/react-tabs";

export const Tabs = styled(TabsPrimitive.Root);

export const TabsList = styled(TabsPrimitive.List, {
  display: "flex",
  boxShadow: "0 1px 0 0 $colors$slate6",
});

export const TabsTrigger = styled(TabsPrimitive.Trigger, {
  all: "unset",
  fontSize: "$2",
  color: "$slate9",
  px: "$5",
  pb: "$2",

  "&:hover": {
    color: "$slate10",
  },

  "&:disabled": {
    opacity: 0.5,
    pointerEvents: "none",
  },

  '&[data-state="active"]': {
    color: "$slate12",
    boxShadow: "0 1px 0 0 $colors$slate12",
    fontWeight: 600,
  },
});

export const TabsContent = styled(TabsPrimitive.Content);
