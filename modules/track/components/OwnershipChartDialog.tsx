import { ProfileWithOwnership } from "@/types";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogTitle,
} from "@/ui/Dialog";
import { OwnershipChart } from "./OwnershipChart";
import { Flex } from "@/ui/Flex";
import { Typography } from "@/ui/Typography";
import { IconButton } from "@/ui/IconButton";
import { RxCross2 } from "react-icons/rx";
import { Box } from "@/ui/Box";

interface OwnershipChartDialogProps {
  profilesWithOwnership: ProfileWithOwnership[];
  open: boolean;
  onClose: () => void;
  title: string | undefined;
}

export const OwnershipChartDialog = ({
  profilesWithOwnership,
  open,
  onClose,
  title,
}: OwnershipChartDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogOverlay />
      <DialogContent css={{ minWidth: 800 }}>
        <Flex justify="between" align="center">
          <DialogTitle asChild>
            <Typography contrast="hi" size="5" weight="5">
              <Typography as="span" size="5">
                Owners of{" "}
              </Typography>
              {title}
            </Typography>
          </DialogTitle>
          <DialogClose asChild pos="relative">
            <IconButton rounded>
              <RxCross2 />
            </IconButton>
          </DialogClose>
        </Flex>
        <Box
          css={{
            height: 1,
            backgroundColor: "$slate5",
            mx: "-$5",
            mt: "$5",
          }}
        />
        <OwnershipChart profilesWithOwnership={profilesWithOwnership} />
      </DialogContent>
    </Dialog>
  );
};
