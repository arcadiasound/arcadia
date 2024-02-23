import { css } from "@/styles/css";
import { DialogOpenProps, Track } from "@/types";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from "@radix-ui/themes";
import { styled } from "@stitches/react";
import { Dispatch, SetStateAction, forwardRef, useRef, useState } from "react";
import { MdLink, MdPlaylistAdd, MdPlaylistPlay, MdShare } from "react-icons/md";
import { toast } from "sonner";
import { ShareDialog } from "./ShareDialog";
import { appConfig } from "@/config";

const StyledDropdownMenuItem = styled(DropdownMenuItem, {
  justifyContent: "start",
  gap: "var(--space-2)",
});

interface ActionsDropdownProps {
  track: Track;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  children: React.ReactNode;
}

export const ActionsDropdown = (props: ActionsDropdownProps) => {
  const [showDialog, setShowDialog] = useState<DialogOpenProps>({
    open: false,
  });
  const dropdownTriggerRef = useRef<HTMLButtonElement | null>(null);

  const handleCopy = async () => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      const origin = window.location.origin;
      await navigator.clipboard.writeText(`${origin}/track?tx=${props.track.txid}`);
      toast.success("Link copied to clipboard", {
        style: css({
          padding: "var(--space-3)",
          borderRadius: "max(var(--radius-2), var(--radius-full))",
          bottom: appConfig.playerMaxHeight,
        }),
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to copy link to clipboard", {
        style: css({
          padding: "var(--space-3)",
          borderRadius: "max(var(--radius-2), var(--radius-full))",
          bottom: appConfig.playerMaxHeight,
        }),
      });
    }
  };

  return (
    <DropdownMenuRoot open={props.open} onOpenChange={(open) => props.setOpen(open ? true : false)}>
      <DropdownMenuTrigger ref={dropdownTriggerRef}>{props.children}</DropdownMenuTrigger>
      <DropdownMenuContent data-track-actions-dropdown hidden={showDialog.open}>
        <ShareDialog
          track={props.track}
          open={showDialog.name === "share" && showDialog.open}
          setOpen={setShowDialog}
          triggerRef={dropdownTriggerRef}
        >
          <StyledDropdownMenuItem onSelect={(event) => event.preventDefault()}>
            <MdShare />
            Share
          </StyledDropdownMenuItem>
        </ShareDialog>
        <StyledDropdownMenuItem onSelect={handleCopy}>
          <MdLink />
          Copy link
        </StyledDropdownMenuItem>
        <StyledDropdownMenuItem>
          <MdPlaylistAdd />
          Add to playlist
        </StyledDropdownMenuItem>
        <StyledDropdownMenuItem>
          <MdPlaylistPlay />
          Add to queue
        </StyledDropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
};
