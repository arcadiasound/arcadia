import { Flex } from "@/ui/Flex";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useMotionAnimate } from "motion-hooks";
import React, { forwardRef, useEffect, useRef } from "react";
import { stagger } from "motion";
import { getComments } from "@/lib/comments";
import { Typography } from "@/ui/Typography";
import { Button } from "@/ui/Button";
import { BsPatchCheckFill, BsSuitHeart } from "react-icons/bs";
import { Box } from "@/ui/Box";
import { Image } from "@/ui/Image";
import { appConfig } from "@/config";
import { timeAgo } from "@/utils";
import { IconButton } from "@/ui/IconButton";
import { useGetUserProfile } from "@/hooks/appData";

interface CommentItemProps {
  owner: string | undefined;
  txid: string | undefined;
  published: string | undefined;
  comment: string;
  isLastItem: boolean;
}

export const TrackCommentItem = forwardRef<HTMLDivElement, CommentItemProps>(
  ({ owner, published, comment, txid, isLastItem }: CommentItemProps, ref) => {
    const replyRef = useRef<HTMLDivElement | null>(null);
    const { play } = useMotionAnimate(
      ".reply",
      { opacity: 1 },
      {
        delay: stagger(0.075),
        duration: 0.75,
        easing: "ease-in-out",
      }
    );

    const { data: profile } = useGetUserProfile({ address: owner });

    const {
      data: repliesData,
      isLoading: repliesLoading,
      isError: repliesError,
      fetchNextPage,
      hasNextPage: moreReplies,
      isFetchingNextPage,
    } = useInfiniteQuery({
      queryKey: [`comment-reply-for${txid}`],
      // cacheTime: 1 * 60 * 1000,
      enabled: !!txid,
      queryFn: ({ pageParam }) => {
        if (!txid) {
          throw new Error("No txid found");
        }

        return getComments({ sourceTx: txid, cursor: pageParam });
      },
      getNextPageParam: (lastPage) => {
        // check if we have more pages.
        if (!lastPage.hasNextPage) {
          return undefined;
        }

        // return the cursor of the last item on the last page.
        return lastPage.data[lastPage.data.length - 1].cursor;
      },
    });

    const repliesList = repliesData?.pages.flatMap((page) => page.data);

    // Play the animation on mount of the component
    useEffect(() => {
      if (repliesList && repliesList.length > 0) {
        play();
      }
    }, [repliesData]);

    const hasReplies = repliesData && repliesData.pages[0]?.data?.length > 0;

    return (
      <Flex
        ref={ref}
        // className and opacity are for motion one animation
        className="comment"
        css={{
          mt: "$2",
          opacity: 1,
          pt: isLastItem ? "$1" : "$3",
          pb: isLastItem || hasReplies ? 0 : "$2",
          position: "relative",
        }}
        align="center"
        gap="2"
      >
        <Flex direction="column" gap="2" align="center">
          <Image
            css={{
              width: 28,
              height: 28,
            }}
            src={
              profile?.Info?.avatar !== appConfig.accountAvatarDefault
                ? profile?.Info?.avatar
                : `https://source.boringavatars.com/marble/28/${owner}`
            }
          />
          {hasReplies && !isLastItem && (
            <Box
              css={{
                background: "linear-gradient(to bottom, #313538 0%, rgba(49, 53, 56, 0) 100%)",
                flex: 1,
                width: 3,
                height: "100%",
              }}
            />
          )}
        </Flex>
        <Flex css={{ width: "100%", position: "relative" }} direction="column">
          <Flex
            css={{
              "& p": { lineHeight: 1 },
            }}
            gap="1"
          >
            <Typography size="1" weight="6">
              {profile?.Info?.handle || profile?.Info?.handle}
            </Typography>

            {/* <Flex
              align="center"
              justify="center"
              css={{
                "& svg": {
                  fill: "$indigo9",
                  width: "$3",
                  height: "$3",
                  verticalAlign: "middle",
                },
              }}
              as="span"
            >
              <BsPatchCheckFill />
            </Flex> */}

            <Typography size="1">• {timeAgo(Number(published))}</Typography>
          </Flex>
          {comment && (
            <Typography size="2" contrast="hi">
              {comment}
            </Typography>
          )}
          {/* <Flex
            css={{
              position: "absolute",
              right: 0,
              bottom: "auto",
              my: "auto",
            }}
          > */}

          {/* </Flex> */}

          {/* {repliesData &&
            repliesData.pages.map((infinitePage, i) => (
              <Flex
                key={i}
                css={{ my: hasReplies ? "$3" : 0 }}
                direction="column"
              >
                {infinitePage.data.map((comment) => (
                  <ReplyItem
                    key={comment.txid}
                    txid={comment.txid}
                    owner={comment.owner}
                    published={comment.published}
                    account={account}
                    comment={comment.comment}
                    commentTx={txid}
                    ref={replyRef}
                  />
                ))}
              </Flex>
            ))} */}
        </Flex>
        // add like button here
      </Flex>
    );
  }
);
