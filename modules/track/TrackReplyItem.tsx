import { appConfig } from "@/appConfig";
import { Button } from "@/ui/Button";
import { Flex } from "@/ui/Flex";
import { Image } from "@/ui/Image";
import { Typography } from "@/ui/Typography";
import { abbreviateAddress, timeAgo } from "@/utils";
import { ArAccount } from "arweave-account";
import { forwardRef, useState } from "react";

interface ReplyItemProps {
  owner: string | undefined;
  txid: string | undefined;
  published: string | undefined;
  account: ArAccount | undefined;
  comment: string;
  commentTx: string | undefined;
}

export const ReplyItem = forwardRef<HTMLDivElement, ReplyItemProps>(
  (
    { owner, published, account, comment, txid, commentTx }: ReplyItemProps,
    ref
  ) => {
    const [openReplyDialog, setOpenReplyDialog] = useState(false);
    const name =
      account && account.handle
        ? account.handle
        : abbreviateAddress({ address: owner });

    const handleOpenReplyDialog = () => setOpenReplyDialog(true);
    const handleCancelReplyDialog = () => setOpenReplyDialog(false);

    return (
      <Flex
        ref={ref}
        // className and opacity are for motion one animation
        className="reply"
        css={{
          opacity: 0,
          my: "$5",
          position: "relative",
        }}
        gap="3"
      >
        <Flex direction="column" gap="2" align="center">
          <Image
            src={
              account?.profile.avatarURL !== appConfig.accountAvatarDefault
                ? account?.profile?.avatarURL
                : `https://source.boringavatars.com/marble/48/${owner}`
            }
          />
          {/* <Avatar
              css={{
                size: 48,
              }}
              size="5"
            >
              <AvatarImage
                src={
                  account?.avatar
                    ? account?.avatar
                    : `https://source.boringavatars.com/marble/40/${owner}`
                }
              />
              <AvatarFallback>{name?.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar> */}
        </Flex>
        <Flex css={{ width: "100%" }} direction="column" gap="1">
          <Flex
            css={{
              "& p": { lineHeight: 1 },
            }}
            align="center"
            gap="1"
          >
            <Typography contrast="hi" weight="6">
              {name}
            </Typography>
            {/* {account?.vouched && (
                <Box
                  css={{
                    "& svg": {
                      fill: "$indigo11",
                      size: "$4",
                      verticalAlign: "middle",
                    },
                  }}
                  as="span"
                >
                  <BsPatchCheckFill />
                </Box>
              )} */}
            {/* {account?.uniqueHandle && (
                <Typography>{account.uniqueHandle}</Typography>
              )} */}
            <Typography size="2">• {timeAgo(Number(published))}</Typography>
          </Flex>
          {comment && <Typography contrast="hi">{comment}</Typography>}
          {/* <Flex align="center" gap="4">
              <Button
                onClick={handleOpenReplyDialog}
                size="1"
                css={{
                  p: 0,
                  lineHeight: 1,
                  height: "max-content",
                  backgroundColor: "transparent",
                  fontSize: "$1",
                  gap: "$2",
  
                  "&:hover": {
                    backgroundColor: "transparent",
                    color: "$slate12",
                  },
  
                  "&:active": {
                    backgroundColor: "transparent",
                    color: "$slate12",
                  },
                }}
              >
                Reply
              </Button>
            </Flex> */}
        </Flex>
      </Flex>
    );
  }
);
