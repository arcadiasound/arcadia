import { appConfig } from "@/appConfig";
import { useDebounce } from "@/hooks/useDebounce";
import { getComments, writeComment } from "@/lib/comments";
import { getProfile } from "@/lib/getProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/Avatar";
import { Box } from "@/ui/Box";
import { Button } from "@/ui/Button";
import { Dialog, DialogContent, DialogOverlay, DialogTitle } from "@/ui/Dialog";
import { Flex } from "@/ui/Flex";
import { Image } from "@/ui/Image";
import { Textarea } from "@/ui/Textarea";
import { Typography } from "@/ui/Typography";
import { abbreviateAddress } from "@/utils";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { FormikErrors, useFormik } from "formik";
import { useMotionAnimate } from "motion-hooks";
import React, { useEffect, useRef, useState } from "react";
import { BsChatQuoteFill, BsSuitHeartFill } from "react-icons/bs";
import { ConnectPrompt } from "../layout/ConnectPrompt";
import { stagger } from "motion";
import { TrackCommentItem } from "./TrackCommentItem";
import { LoadingSpinner } from "@/ui/Loader";
import { useConnect } from "@/hooks/useConnect";

interface Comment {
  comment: string;
  sourceTx: string;
  address: string | undefined;
}

interface TrackCommentsDialogProps {
  txid: string | undefined;
}

export const TrackComments = ({ txid }: TrackCommentsDialogProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);
  const [showConnectPrompt, setShowConnectPrompt] = useState(false);
  // temp solution, connect method from sdk should prob return a promise
  const [userConnect, setUserConnect] = useState(false);
  const { walletAddress, connect } = useConnect();
  const commentRef = useRef<HTMLDivElement | null>(null);

  const handleShowConnectPrompt = () => setShowConnectPrompt(true);
  const handleCancelConnectPrompt = () => setShowConnectPrompt(false);

  const queryClient = useQueryClient();

  const { data: account } = useQuery({
    queryKey: [`profile-${walletAddress}`],
    queryFn: () => {
      if (!walletAddress) {
        return;
      }

      return getProfile(walletAddress);
    },
  });

  const {
    data: commentsData,
    isLoading: commentsLoading,
    isError: commentsError,
    fetchNextPage,
    hasNextPage: moreComments,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: [`comments-for-${txid}`],
    cacheTime: 1 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: ({ pageParam }) =>
      getComments({ sourceTx: txid, cursor: pageParam }),
    getNextPageParam: (lastPage) => {
      // check if we have more pages.
      if (!lastPage.hasNextPage) {
        return undefined;
      }

      // return the cursor of the last item on the last page.
      return lastPage.data[lastPage.data.length - 1].cursor;
    },
  });
  const formik = useFormik<Pick<Comment, "comment">>({
    initialValues: {
      comment: "",
    },
    validateOnBlur: false,
    validateOnChange: false,
    validate: (values) => {
      const errors: FormikErrors<Pick<Comment, "comment">> = {};

      if (values.comment && values.comment.length < 2) {
        errors.comment = "Comment must be a minimum of 3 characters.";
      }

      if (values.comment && values.comment.length > 300) {
        errors.comment = "Comment must be a maximum of 300 characters.";
      }

      if (submitting) {
        setSubmitting(false);
      }
      return errors;
    },
    onSubmit: async (values, { setErrors, validateForm }) => {
      setSubmitting(true);
      validateForm();

      if (!walletAddress) {
        handleShowConnectPrompt();
        return;
      }

      if (!txid) {
        return;
      }

      commentMutation.mutate({
        comment: values.comment as string,
        sourceTx: txid,
        address: walletAddress,
      });
    },
  });

  useEffect(() => {
    if (walletAddress && userConnect && txid) {
      setUserConnect(false);
      handleCancelConnectPrompt();
      commentMutation.mutate({
        comment: formik.values.comment,
        sourceTx: txid,
        address: walletAddress,
      });
    }
  }, [walletAddress]);

  useEffect(() => {
    // reset posting state when user cancels dialog
    if (!showConnectPrompt) {
      if (submitting) {
        setSubmitting(false);
      }
    }
  }, [showConnectPrompt]);

  const debounceRefetch = useDebounce(() => {
    refetch();
  }, 250);

  const commentMutation = useMutation({
    mutationFn: writeComment,
    onSuccess: (data) => {
      debounceRefetch();
      if (submitting) {
        setSubmitting(false);
      }
      setCommentSuccess(
        `Comment successfully created: ${abbreviateAddress({
          address: txid,
        })}`
      );

      formik.resetForm();
    },
    onError: (error: any) => {
      document.body.style.pointerEvents = "none";
      if (submitting) {
        setSubmitting(false);
      }
      console.error(error);
    },
  });

  const handleConnectAndComment = async () => {
    if (!txid) {
      return;
    }

    /* as we can't await below connect method we need to check
      if user tried to connect and use presence of this state var and walletAddress to initiate like
      and close dialog
    */

    connect({ appName: "Arcadia", walletProvider: "arweave.app" });

    setUserConnect(true);
  };

  const commentList = commentsData?.pages.flatMap((page) => page.data);

  // Play the animation on mount of the component
  // useEffect(() => {
  //   if (commentList && commentList.length > 0) {
  //     play();
  //   }
  // }, [commentsData]);

  return (
    <Box>
      <Flex as="form" onSubmit={formik.handleSubmit} justify="between" gap="2">
        {walletAddress && (
          <Image
            css={{
              br: "$1",
              overflow: "hidden",
              boxSize: "$8",
            }}
            src={
              account?.profile.avatarURL !== appConfig.accountAvatarDefault
                ? account?.profile.avatarURL
                : `https://source.boringavatars.com/marble/32/${walletAddress}?square`
            }
          />
        )}
        <Flex
          align="center"
          css={{
            pt: 2,
            pl: "$1",
            flex: 1,
            boxShadow: "0 0 0 1px $colors$slate3",
            br: "$1",

            "&:hover": {
              boxShadow: "0 0 0 1px $colors$slate4",
            },

            "&:focus-within": {
              boxShadow: "0 0 0 2px $colors$focus",
            },
          }}
        >
          <Textarea
            css={{
              flex: 1,

              boxShadow: "none",
              resize: "none",

              "&:hover": {
                boxShadow: "none",
              },

              "&:focus": {
                boxShadow: "none",
              },
            }}
            name="comment"
            value={formik.values.comment}
            onChange={formik.handleChange}
            required
            minLength={3}
            maxLength={300}
            variant="outline"
            size="1"
            placeholder="Share your thoughts..."
          />
        </Flex>
        <Button
          size="1"
          type="submit"
          disabled={submitting || !formik.values.comment}
          // css={{ alignSelf: "end" }}
          variant="solid"
        >
          {submitting ? "Posting..." : "Post"}
        </Button>
      </Flex>

      <Flex
        direction="column"
        css={{ mt: commentList && commentList.length > 0 ? "$5" : 0 }}
      >
        {commentsData?.pages.map((infinitePage, i) => (
          <React.Fragment key={i}>
            {infinitePage.data
              .map((comment, i) => (
                <TrackCommentItem
                  key={comment.txid}
                  txid={comment.txid}
                  owner={comment.owner}
                  published={comment.published}
                  comment={comment.comment}
                  // account={comment.account}
                  ref={commentRef}
                  isLastItem={
                    infinitePage.data[infinitePage.data.length - 1].txid ===
                    comment.txid
                  }
                />
              ))
              .reverse()}
          </React.Fragment>
        ))}
      </Flex>
      {commentsLoading && (
        <Flex
          css={{
            my: "$10",
            width: "100%",
            min: 80,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <LoadingSpinner />
        </Flex>
      )}
      {/* prevent false pagination for excluded/filtered results that are not factored into hasNextPage */}
      {moreComments && commentList && commentList?.length > 0 && (
        <Button
          disabled={isFetchingNextPage}
          variant="solid"
          css={{
            alignSelf: "center",
          }}
          onClick={() => {
            setLoadingMore(true);
            fetchNextPage();
          }}
        >
          {isFetchingNextPage
            ? "Loading more comments..."
            : "Load more comments"}
        </Button>
      )}
      {commentsError ||
        // if there is no comment items on the first page, show no data view
        (commentsData?.pages[0].data.length === 0 && !commentsLoading && (
          <Flex
            align="center"
            css={{
              mt: "$10",
              "& svg": { width: "$5", height: "$5" },
              color: "$slate11",
            }}
            direction="column"
            gap="3"
          >
            <BsChatQuoteFill />
            <Typography size="2" weight="6">
              No comments yet...
            </Typography>
            <Typography size="1">
              Be the first to share your thoughts!
            </Typography>
          </Flex>
        ))}
    </Box>
  );
};
