import { ComponentProps, keyframes, styled } from "../stitches.config";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import React, { forwardRef } from "react";

const overlayShow = keyframes({
  "0%": { opacity: 0 },
  "100%": { opacity: 1 },
});

const StyledOverlay = styled(AlertDialogPrimitive.Overlay, {
  zIndex: "$overlay",
  backgroundColor: "rgba(8, 8, 8, 0.75)",
  backdropFilter: "blur(1px)",
  position: "fixed",
  inset: 0,

  "@media (prefers-reduced-motion: no-preference)": {
    animation: `${overlayShow} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
  },
});

const contentShow = keyframes({
  "0%": { opacity: 0, transform: "translate(-50%, -48%) scale(.96)" },
  "100%": { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
});

const StyledDialogContent = styled(AlertDialogPrimitive.Content, {
  br: "$3",
  backgroundColor: "$slate1",
  boxShadow: "0 0 0 1px $colors$slate3",
  position: "fixed",
  zIndex: "$modal",
  top: 0,
  bottom: 0,
  right: 0,
  left: 0,
  mx: "auto",
  my: "auto",
  width: "100%",
  maxWidth: 550,
  maxHeight: "max-content",
  overflow: "scroll",
  "&:focus": { outline: "none" },
  p: "$5",

  "@bp3": {
    maxHeight: "85vh",
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",

    "@media (prefers-reduced-motion: no-preference)": {
      animation: `${contentShow} 250ms cubic-bezier(0.16, 1, 0.3, 1)`,
    },
  },
});

export type DialogContentProps = ComponentProps<typeof StyledDialogContent> &
  AlertDialogPrimitive.AlertDialogPortalProps;

export const AlertDialogContent = forwardRef<
  HTMLDivElement,
  DialogContentProps
>(({ children, forceMount, container, ...props }, ref) => {
  return (
    <AlertDialogPrimitive.Portal forceMount={forceMount} container={container}>
      <AlertDialogOverlay />
      <StyledDialogContent ref={ref} {...props}>
        {children}
      </StyledDialogContent>
    </AlertDialogPrimitive.Portal>
  );
});

export const AlertDialog = AlertDialogPrimitive.Root;
export const AlertDialogOverlay = StyledOverlay;
export const AlertDialogPortal = AlertDialogPrimitive.Portal;
export const AlertDialogTrigger = styled(AlertDialogPrimitive.Trigger);
export const AlertDialogTitle = styled(AlertDialogPrimitive.Title);
export const AlertDialogDescription = styled(AlertDialogPrimitive.Description);
export const AlertDialogCancel = styled(AlertDialogPrimitive.Cancel);
export const AlertDialogAction = styled(AlertDialogPrimitive.Action);
