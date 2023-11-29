import { ComponentProps, keyframes, styled } from "../stitches.config";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import React, { forwardRef } from "react";

const overlayShow = keyframes({
  "0%": { opacity: 0 },
  "100%": { opacity: 1 },
});

const StyledOverlay = styled(DialogPrimitive.Overlay, {
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

const StyledDialogContent = styled(DialogPrimitive.Content, {
  br: "$3",
  backgroundColor: "$slate1",
  boxShadow: "0px 0px 33px rgba(0, 0, 0, 0.08)",
  position: "fixed",
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
  DialogPrimitive.PortalProps;

export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  ({ children, forceMount, container, ...props }, ref) => {
    return (
      <>
        <DialogOverlay />
        <DialogPrimitive.Portal forceMount={forceMount} container={container}>
          <StyledDialogContent ref={ref} {...props}>
            {children}
          </StyledDialogContent>
        </DialogPrimitive.Portal>
      </>
    );
  }
);

const StyledCloseButton = styled(DialogPrimitive.Close, {
  variants: {
    pos: {
      absolute: {
        position: "absolute",

        top: "$3",
        right: "$3",
      },
      relative: {
        position: "relative",

        top: 0,
        right: 0,
      },
    },
  },

  defaultVariants: {
    pos: "absolute",
  },
});

export const Dialog = DialogPrimitive.Root;
export const DialogOverlay = StyledOverlay;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogTrigger = styled(DialogPrimitive.Trigger);
export const DialogTitle = styled(DialogPrimitive.Title);
export const DialogDescription = styled(DialogPrimitive.Description);
export const DialogClose = StyledCloseButton;
