import { DialogOpenProps, Track } from "@/types";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from "@radix-ui/themes";
import { styled } from "@stitches/react";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import { MdLink, MdPlaylistAdd, MdPlaylistPlay, MdShare } from "react-icons/md";
import { toast } from "sonner";
import { ShareDialog } from "./ShareDialog";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

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
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  const origin = window.location.origin;

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
        <StyledDropdownMenuItem
          onSelect={async () => {
            await copyToClipboard(`${origin}/track?tx=${props.track.txid}`);
            toast.success("Link copied to clipboard");
          }}
        >
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
