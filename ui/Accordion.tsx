import { keyframes, styled } from "@/stitches.config";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ComponentProps, forwardRef } from "react";
import { RxTriangleRight } from "react-icons/rx";
import { Box } from "./Box";

const slideDown = keyframes({
  from: { height: 0 },
  to: { height: "var(--radix-accordion-content-height)" },
});

const slideUp = keyframes({
  from: { height: "var(--radix-accordion-content-height)" },
  to: { height: 0 },
});

const fadeIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

const fadeOut = keyframes({
  from: { opacity: 1 },
  to: { opacity: 0 },
});

export const Accordion = styled(AccordionPrimitive.Root);

export const AccordionItem = styled(AccordionPrimitive.Item, {
  overflow: "hidden",
  marginTop: 1,

  "&:focus-within": {
    "&:focus-visible": {
      position: "relative",
      zIndex: 1,
      boxShadow: "0 0 0 2px $colors$blue8",
    },
  },
});

const StyledHeader = styled(AccordionPrimitive.Header, {
  all: "unset",
  display: "flex",
});

const StyledTrigger = styled(AccordionPrimitive.Trigger, {
  all: "unset",
  display: "flex",
  alignItems: "center",
  gap: "$2",
  py: "$1",
  flex: 1,
  backgroundColor: "transparent",
  fontSize: "$3",
  lineHeight: 1,

  "&:hover": {
    color: "$slate12",

    "& svg": {
      color: "$slate12",
    },
  },

  "[data-state=open] &": { color: "$slate12" },
});

const StyledIcon = styled("span", {
  fontSize: "$5",
  display: "flex",
  placeItems: "center",
  color: "$slate11",
  transition: "transform 300ms ease",
  "[data-state=open] &": { transform: "rotate(90deg)", color: "$slate12" },
});

export const AccordionTrigger = forwardRef<
  HTMLButtonElement,
  ComponentProps<typeof StyledTrigger>
>(({ children, ...props }, forwardedRef) => (
  <StyledHeader>
    <StyledTrigger {...props} ref={forwardedRef}>
      <StyledIcon>
        <RxTriangleRight aria-hidden />
      </StyledIcon>
      {children}
    </StyledTrigger>
  </StyledHeader>
));

const StyledContentWrapper = styled("div", {
  px: "$3",
});

const StyledContent = styled(AccordionPrimitive.Content, {
  overflow: "hidden",
  color: "$slate12",

  '&[data-state="open"]': {
    animation: `${slideDown} 300ms cubic-bezier(.27,.15,.26,1)`,

    [`& ${StyledContentWrapper}`]: {
      animation: `${fadeIn} 600ms cubic-bezier(.27,.15,.26,1)`,
    },
  },
  '&[data-state="closed"]': {
    animation: `${slideUp} 200ms cubic-bezier(.27,.15,.26,1)`,

    [`& ${StyledContentWrapper}`]: {
      animation: `${fadeOut} 200ms cubic-bezier(.27,.15,.26,1)`,
    },
  },
});

export const AccordionContent = forwardRef<
  HTMLDivElement,
  ComponentProps<typeof StyledContent>
>(({ children, ...props }, forwardedRef) => (
  <StyledContent {...props} ref={forwardedRef}>
    {/* <Box css={{ height: 1, backgroundColor: "$slate5" }} /> */}
    <StyledContentWrapper>{children}</StyledContentWrapper>
  </StyledContent>
));
