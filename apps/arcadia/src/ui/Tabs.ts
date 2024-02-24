import { styled } from "@/apps/arcadia/stitches.config";
import * as TabsPrimitive from "@radix-ui/react-tabs";

export const Tabs = styled(TabsPrimitive.Root);

export const TabsList = styled(TabsPrimitive.List, {
  display: "flex",
  boxShadow: "0 1px 0 0 $colors$slate6",
});

export const TabsTrigger = styled(TabsPrimitive.Trigger, {
  all: "unset",
  userSelect: "none",
  color: "$slate9",

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
    fontWeight: 500,
  },

  variants: {
    size: {
      1: {
        fontSize: "$2",
        px: "$5",
        py: "$2",
      },
      2: {
        fontSize: "$3",
        px: "$5",
        py: "$2",
      },
    },
  },

  defaultVariants: {
    size: "1",
  },
});

export const TabsContent = styled(TabsPrimitive.Content);
