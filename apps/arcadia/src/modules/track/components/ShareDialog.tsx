import { css } from "@/styles/css";
import { DialogOpenProps, Track } from "@/types";
import {
  Box,
  DialogClose,
  DialogContent,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  Flex,
  IconButton,
  Text,
  VisuallyHidden,
} from "@radix-ui/themes";
import { Dispatch, MutableRefObject, SetStateAction, useState } from "react";
import { BsCopy, BsTelegram, BsTwitterX, BsWhatsapp } from "react-icons/bs";
import { MdLink } from "react-icons/md";
import { RxCheck, RxCross2 } from "react-icons/rx";
import { toast } from "sonner";

const HEADING_SIZE = 4;
const TRACK_ARTWORK_SIZE = 80;
const OUTLINE_OFFSET = 0.5;
const TRACK_ARTWORK_RADIUS = `max(var(--radius-1), var(--radius-4) * 0.6)`;

const TWITTER_WEB_INTENT_URL = "https://twitter.com/intent/tweet";
const SHARE_BUTTON_VARIANT = "surface";

interface ShareDialogProps {
  track: Track;
  open: boolean;
  setOpen: Dispatch<SetStateAction<DialogOpenProps>>;
  triggerRef: MutableRefObject<HTMLButtonElement | null>;
  children: React.ReactNode;
}

export const ShareDialog = (props: ShareDialogProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const SHARE_TEXT_TWITTER = `Check out this track ${props.track.title} on @arcadia_sound \n \n`;
  const SHARE_TEXT = `Check out this track ${props.track.title} on Arcadia \n \n`;
  const origin = window.location.origin;
  const SHARE_URL = `${origin}/#/track?tx=${props.track.txid}`;

  const twitterUrl = `${TWITTER_WEB_INTENT_URL}?url=${encodeURIComponent(
    SHARE_URL
  )}&text=${encodeURIComponent(SHARE_TEXT_TWITTER)}`;
  const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(
    SHARE_TEXT
  )}%20${encodeURIComponent(SHARE_URL)}`;
  const telegramUrl = `https://telegram.me/share/url?url=${SHARE_URL}&text=${SHARE_TEXT}`;

  const handleCopy = async () => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      await navigator.clipboard.writeText(
        `${origin}/#/track?tx=${props.track.txid}`
      );
      toast.success("Link copied to clipboard", {
        style: css({ padding: "var(--space-3)", zIndex: "var(--z-toast)" }),
      });
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error(err);
      toast.error("Failed to copy link to clipboard", {
        style: css({ padding: "var(--space-3)" }),
      });
    }
  };

  return (
    <DialogRoot
      open={props.open}
      onOpenChange={(open) => {
        props.setOpen({ open: open ? true : false, name: "share" });
        props.triggerRef.current?.focus();
      }}
    >
      <DialogTrigger>{props.children}</DialogTrigger>
      <DialogContent style={css({ maxWidth: 500, position: "relative" })}>
        <DialogTitle size={`${HEADING_SIZE}`}>
          Share this song with the world
        </DialogTitle>

        <DialogClose>
          <IconButton
            color="gray"
            variant="soft"
            style={css({
              position: "absolute",
              right: "var(--space-3)",
              top: "var(--space-3)",
            })}
          >
            <RxCross2 />
          </IconButton>
        </DialogClose>

        <Flex
          gap="5"
          mt="5"
          style={css({
            padding: "var(--space-3)",
            backgroundColor: "var(--gray-3)",
            borderRadius: TRACK_ARTWORK_RADIUS,
          })}
        >
          <Box
            style={css({
              width: `calc(${TRACK_ARTWORK_SIZE}px * var(--scaling))`,
              height: `calc(${TRACK_ARTWORK_SIZE}px * var(--scaling))`,
              outline: `${OUTLINE_OFFSET}px solid var(--white-a3)`,
              outlineOffset: -OUTLINE_OFFSET,
              borderRadius: TRACK_ARTWORK_RADIUS,
              overflow: "hidden",
              position: "relative",
            })}
          >
            <img
              src={props.track.thumbnailSrc}
              alt={`Cover artwork for ${props.track.title}`}
              style={css({
                objectFit: "cover",
                width: "100%",
                height: "100%",
              })}
            />
          </Box>
          <Flex direction="column" justify="between">
            <Box>
              <Text weight="medium">{props.track.title}</Text>
              <Text
                color="gray"
                style={css({
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  maxWidth: "24ch",
                  display: "block",
                })}
              >
                {props.track.creator}
              </Text>
            </Box>
            <Text size="1">2:36</Text>
          </Flex>
        </Flex>

        <Flex mt="5" direction="column" gap="3" align="center">
          <Text size="2">Share this track via: </Text>
          <Flex align="center" justify="center" gap="5" asChild>
            <ul>
              <li>
                <IconButton size="4" variant={SHARE_BUTTON_VARIANT} asChild>
                  <a href={twitterUrl}>
                    <VisuallyHidden>X / Twitter</VisuallyHidden>
                    <BsTwitterX />
                  </a>
                </IconButton>
              </li>
              <li>
                <IconButton size="4" variant={SHARE_BUTTON_VARIANT} asChild>
                  <a href={whatsappUrl}>
                    <VisuallyHidden>Whatsapp</VisuallyHidden>
                    <BsWhatsapp />
                  </a>
                </IconButton>
              </li>
              <li>
                <IconButton size="4" variant={SHARE_BUTTON_VARIANT} asChild>
                  <a href={telegramUrl}>
                    <VisuallyHidden>Telegram</VisuallyHidden>
                    <BsTelegram />
                  </a>
                </IconButton>
              </li>
              <li>
                <IconButton
                  onClick={handleCopy}
                  aria-label="Copy song link"
                  size="4"
                  variant={isCopied ? "solid" : SHARE_BUTTON_VARIANT}
                >
                  {isCopied ? <RxCheck /> : <BsCopy />}
                </IconButton>
              </li>
            </ul>
          </Flex>
        </Flex>
      </DialogContent>
    </DialogRoot>
  );
};
