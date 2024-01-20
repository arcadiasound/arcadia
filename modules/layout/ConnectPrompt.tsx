import { Button } from "@/ui/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogTitle,
} from "@/ui/Dialog";
import { Flex } from "@/ui/Flex";
import { Typography } from "@/ui/Typography";
import { ConnectIcon } from "./components/ConnectIcon";
import { IconButton } from "@/ui/IconButton";
import { RxCross2 } from "react-icons/rx";
import { Box } from "@/ui/Box";

interface ConnectPromptProps {
  title: string;
  description: string;
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
}

export const ConnectPrompt = ({
  title,
  description,
  children,
  open,
  onClose,
}: ConnectPromptProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogOverlay />
      <DialogContent css={{ maxWidth: 450, textAlign: "center", pb: "$7" }}>
        <Flex align="center" justify="between">
          <DialogTitle asChild>
            <Typography contrast="hi" size="4" weight="5">
              {title}
            </Typography>
          </DialogTitle>
          <DialogClose asChild pos="relative">
            <IconButton rounded size="2">
              <RxCross2 />
            </IconButton>
          </DialogClose>
        </Flex>
        <Box
          css={{ my: "$5", mx: "-$5", height: 1, backgroundColor: "$slate5" }}
        />
        <Flex
          css={{
            width: "100%",
            color: "$slate12",
            mb: "$5",
          }}
          justify="center"
        >
          <ConnectIcon width={150} height={150} />
        </Flex>
        <DialogDescription asChild>
          <Typography css={{ mt: "$1" }} size="2">
            {description}
          </Typography>
        </DialogDescription>
        <Flex justify="center">{children}</Flex>
      </DialogContent>
    </Dialog>
  );
};
