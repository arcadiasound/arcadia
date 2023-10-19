import { Button } from "@/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogTitle,
} from "@/ui/Dialog";
import { Flex } from "@/ui/Flex";
import { Typography } from "@/ui/Typography";

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
      <DialogContent css={{ maxWidth: 450, textAlign: "center" }}>
        <DialogTitle asChild>
          <Typography contrast="hi" size="5" weight="5">
            {title}
          </Typography>
        </DialogTitle>
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
