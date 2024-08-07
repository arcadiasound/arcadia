import { useGetUserProfile } from "@/hooks/appData";
import { css } from "@/styles/css";
import { abbreviateAddress, gateway } from "@/utils";
import {
  Avatar,
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  IconButton,
  Link,
  Text,
  TextFieldInput,
  TextFieldRoot,
  TextFieldSlot,
} from "@radix-ui/themes";
import { styled } from "@stitches/react";
import { useActiveAddress } from "arweave-wallet-kit";
import Avvvatars from "avvvatars-react";
import * as Form from "@radix-ui/react-form";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useZorm } from "react-zorm";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Track } from "@/types";
import { getComments, writeComment } from "@/lib/comments";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { IoMdHeart, IoMdHeartEmpty } from "react-icons/io";
import { RxDotsHorizontal } from "react-icons/rx";

const CommentSchema = z.object({
  comment: z.string().min(1).max(150),
});

const StyledForm = styled(Form.Root);

const StyledAvatar = styled(Avatar);

const StyledTextFieldRoot = styled(TextFieldRoot, {
  ".rt-TextFieldSlot": {
    paddingInline: "var(--space-1)",
  },
});

const AVATAR_SIZE = 24;

interface TrackCommentsProps {
  track: Track;
}

export const TrackComments = (props: TrackCommentsProps) => {
  const [commentValue, setCommentValue] = useState<string>();
  const connectedAddress = useActiveAddress();

  const zo = useZorm("comment", CommentSchema, {
    onValidSubmit(e) {
      e.preventDefault();
      commentPost.mutate({
        comment: e.data.comment,
        sourceTx: props.track.txid,
      });
    },
  });

  const commentPost = useMutation({
    mutationKey: [`comment-${props.track.txid}`],
    mutationFn: writeComment,
  });

  const { data: comments } = useQuery({
    queryKey: [`comments-${props.track.txid}`],
    queryFn: () => getComments({ sourceTx: props.track.txid }),
    refetchInterval: 5000,
  });

  const { data: userMe } = useGetUserProfile({ address: connectedAddress });
  const userMeAvatarUrl = gateway() + "/" + userMe?.Info?.avatar;

  return (
    <Flex
      direction="column"
      gap="3"
      p="5"
      style={css({
        borderRadius: "max(var(--radius-3), var(--radius-4))",
        backgroundColor: "var(--side-panel-background)",
        minHeight: "100%",
      })}
    >
      <Heading as="h3" size="4" weight="medium">
        Comments
      </Heading>
      {connectedAddress && (
        <StyledForm ref={zo.ref}>
          <StyledTextFieldRoot>
            <TextFieldSlot>
              <StyledAvatar
                src={userMeAvatarUrl}
                fallback={
                  <Avvvatars style="shape" value={connectedAddress} size={AVATAR_SIZE} radius={0} />
                }
                style={css({
                  width: AVATAR_SIZE,
                  height: AVATAR_SIZE,
                  overflow: "hidden",
                })}
                css={{
                  ".rt-AvatarFallback > div": {
                    borderRadius: 0,
                  },
                }}
              />
            </TextFieldSlot>
            <TextFieldInput
              value={commentValue}
              onChange={(e) => setCommentValue(e.target.value)}
              name={zo.fields.comment()}
              placeholder="Share your thoughts"
            />
            <TextFieldSlot>
              <Button disabled={!commentValue || commentPost.isLoading} size="1">
                {commentPost.isLoading ? "Sending..." : "Send"}
              </Button>
            </TextFieldSlot>
          </StyledTextFieldRoot>
          {zo.errors.comment((e) => (
            <Text size="1" aria-live="polite" color="red">
              {e.message}
            </Text>
          ))}
        </StyledForm>
      )}
      {comments && comments.data.length > 0 && (
        <Flex mt="4" mx="0" asChild>
          <ul>
            {comments.data.map((comment) => (
              <CommentItem comment={comment} key={comment.txid} />
            ))}
          </ul>
        </Flex>
      )}
    </Flex>
  );
};

interface CommentItemProps {
  comment: {
    author: string;
    txid: string;
    published: number | undefined;
    data: any;
    cursor: string;
  };
}

const CommentItem = (props: CommentItemProps) => {
  const [liked, setLiked] = useState(false);
  const { data } = useGetUserProfile({ address: props.comment.author });
  const { data: profile } = useGetUserProfile({ address: props.comment.author });

  const avatarUrl = gateway() + "/" + profile?.Info?.avatar;

  return (
    <Flex gap="2" width="100%" align="center" asChild>
      <li>
        <Flex gap="3">
          <StyledAvatar
            src={avatarUrl}
            fallback={
              <Avvvatars
                style="shape"
                value={props.comment.author}
                size={AVATAR_SIZE * 1.5}
                radius={0}
              />
            }
            style={css({
              width: AVATAR_SIZE * 1.5,
              height: AVATAR_SIZE * 1.5,
              overflow: "hidden",
            })}
            css={{
              ".rt-AvatarFallback > div": {
                borderRadius: 0,
              },
            }}
          />
          <Flex direction="column">
            <Link
              size="2"
              highContrast
              color="gray"
              style={css({
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                overflow: "hidden",
                maxWidth: "40ch",
              })}
              asChild
            >
              <RouterLink to={`/profile?addr=${props.comment.author}`}>
                {(profile?.Info?.handle && `@${profile?.Info?.handle}`) ||
                  profile?.Info?.name ||
                  abbreviateAddress({ address: props.comment.author })}
              </RouterLink>
            </Link>
            <Text>{props.comment.data}</Text>
          </Flex>
        </Flex>
        <Flex ml="auto" gap="2">
          <IconButton
            onClick={() => setLiked(!liked)}
            size="1"
            variant="ghost"
            color={liked ? undefined : "gray"}
            style={css({
              color: liked ? "var(--accent-11)" : undefined,
            })}
          >
            {liked ? <IoMdHeart /> : <IoMdHeartEmpty />}
          </IconButton>
          <IconButton size="1" variant="ghost" color="gray">
            <RxDotsHorizontal />
          </IconButton>
        </Flex>
      </li>
    </Flex>
  );
};

// import { useDebounce } from "@/hooks/useDebounce";
// import { getComments, writeComment } from "@/lib/comments";
// import { Avatar, AvatarFallback, AvatarImage } from "@/ui/Avatar";
// import { Box } from "@/ui/Box";
// import { Button } from "@/ui/Button";
// import { Dialog, DialogContent, DialogOverlay, DialogTitle } from "@/ui/Dialog";
// import { Flex } from "@/ui/Flex";
// import { Image } from "@/ui/Image";
// import { Textarea } from "@/ui/Textarea";
// import { Typography } from "@/ui/Typography";
// import { abbreviateAddress, gateway } from "@/utils";
// import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { FormikErrors, useFormik } from "formik";
// import { useMotionAnimate } from "motion-hooks";
// import React, { useEffect, useRef, useState } from "react";
// import { BsChatQuoteFill, BsSuitHeartFill } from "react-icons/bs";
// import { ConnectPrompt } from "../layout/ConnectPrompt";
// import { stagger } from "motion";
// import { TrackCommentItem } from "./TrackCommentItem";
// import { LoadingSpinner } from "@/ui/Loader";
// import { useConnect } from "@/hooks/useConnect";
// import { getProfile } from "@/lib/profile/getProfile";
// import { useGetUserProfile } from "@/hooks/appData";

// interface Comment {
//   comment: string;
//   sourceTx: string;
//   address: string | undefined;
// }

// interface TrackCommentsDialogProps {
//   txid: string | undefined;
// }

// export const TrackComments = ({ txid }: TrackCommentsDialogProps) => {
//   const [submitting, setSubmitting] = useState(false);
//   const [commentSuccess, setCommentSuccess] = useState("");
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [showConnectPrompt, setShowConnectPrompt] = useState(false);
//   // temp solution, connect method from sdk should prob return a promise
//   const [userConnect, setUserConnect] = useState(false);
//   const { walletAddress, connect } = useConnect();
//   const commentRef = useRef<HTMLDivElement | null>(null);

//   const handleShowConnectPrompt = () => setShowConnectPrompt(true);
//   const handleCancelConnectPrompt = () => setShowConnectPrompt(false);

//   const queryClient = useQueryClient();

//   const { data } = useGetUserProfile({ address: walletAddress });
//   const profile = data?.profiles.length ? data.profiles[0] : undefined;

//   const bannerUrl = gateway() + "/" + profile?.bannerId;
//   const avatarUrl = gateway() + "/" + profile?.avatarId;

//   const {
//     data: commentsData,
//     isLoading: commentsLoading,
//     isError: commentsError,
//     fetchNextPage,
//     hasNextPage: moreComments,
//     isFetchingNextPage,
//     refetch,
//   } = useInfiniteQuery({
//     queryKey: [`comments-for-${txid}`],
//     cacheTime: 1 * 60 * 1000,
//     refetchOnWindowFocus: false,
//     queryFn: ({ pageParam }) => getComments({ sourceTx: txid, cursor: pageParam }),
//     getNextPageParam: (lastPage) => {
//       // check if we have more pages.
//       if (!lastPage.hasNextPage) {
//         return undefined;
//       }

//       // return the cursor of the last item on the last page.
//       return lastPage.data[lastPage.data.length - 1].cursor;
//     },
//   });
//   const formik = useFormik<Pick<Comment, "comment">>({
//     initialValues: {
//       comment: "",
//     },
//     validateOnBlur: false,
//     validateOnChange: false,
//     validate: (values) => {
//       const errors: FormikErrors<Pick<Comment, "comment">> = {};

//       if (values.comment && values.comment.length < 2) {
//         errors.comment = "Comment must be a minimum of 3 characters.";
//       }

//       if (values.comment && values.comment.length > 300) {
//         errors.comment = "Comment must be a maximum of 300 characters.";
//       }

//       if (submitting) {
//         setSubmitting(false);
//       }
//       return errors;
//     },
//     onSubmit: async (values, { setErrors, validateForm }) => {
//       setSubmitting(true);
//       validateForm();

//       if (!walletAddress) {
//         handleShowConnectPrompt();
//         return;
//       }

//       if (!txid) {
//         return;
//       }

//       commentMutation.mutate({
//         comment: values.comment as string,
//         sourceTx: txid,
//         address: walletAddress,
//       });
//     },
//   });

//   useEffect(() => {
//     if (walletAddress && userConnect && txid) {
//       setUserConnect(false);
//       handleCancelConnectPrompt();
//       commentMutation.mutate({
//         comment: formik.values.comment,
//         sourceTx: txid,
//         address: walletAddress,
//       });
//     }
//   }, [walletAddress]);

//   useEffect(() => {
//     // reset posting state when user cancels dialog
//     if (!showConnectPrompt) {
//       if (submitting) {
//         setSubmitting(false);
//       }
//     }
//   }, [showConnectPrompt]);

//   const debounceRefetch = useDebounce(() => {
//     refetch();
//   }, 250);

//   const commentMutation = useMutation({
//     mutationFn: writeComment,
//     onSuccess: (data) => {
//       debounceRefetch();
//       if (submitting) {
//         setSubmitting(false);
//       }
//       setCommentSuccess(
//         `Comment successfully created: ${abbreviateAddress({
//           address: txid,
//         })}`
//       );

//       formik.resetForm();
//     },
//     onError: (error: any) => {
//       document.body.style.pointerEvents = "none";
//       if (submitting) {
//         setSubmitting(false);
//       }
//       console.error(error);
//     },
//   });

//   const handleConnectAndComment = async () => {
//     if (!txid) {
//       return;
//     }

//     /* as we can't await below connect method we need to check
//       if user tried to connect and use presence of this state var and walletAddress to initiate like
//       and close dialog
//     */

//     connect({ appName: "Arcadia", walletProvider: "arweave.app" });

//     setUserConnect(true);
//   };

//   const commentList = commentsData?.pages.flatMap((page) => page.data);

//   // Play the animation on mount of the component
//   // useEffect(() => {
//   //   if (commentList && commentList.length > 0) {
//   //     play();
//   //   }
//   // }, [commentsData]);

//   return (
//     <Box>
//       <Flex as="form" onSubmit={formik.handleSubmit} justify="between" gap="2">
//         {walletAddress && (
//           <Image
//             css={{
//               br: "$1",
//               overflow: "hidden",
//               boxSize: "$8",
//             }}
//             src={
//               profile?.avatarURL !== appConfig.accountAvatarDefault
//                 ? account?.profile.avatarURL
//                 : `https://source.boringavatars.com/marble/32/${walletAddress}?square`
//             }
//           />
//         )}
//         <Flex
//           align="center"
//           css={{
//             pt: 2,
//             pl: "$1",
//             flex: 1,
//             boxShadow: "0 0 0 1px $colors$slate3",
//             br: "$1",

//             "&:hover": {
//               boxShadow: "0 0 0 1px $colors$slate4",
//             },

//             "&:focus-within": {
//               boxShadow: "0 0 0 2px $colors$focus",
//             },
//           }}
//         >
//           <Textarea
//             css={{
//               flex: 1,

//               boxShadow: "none",
//               resize: "none",

//               "&:hover": {
//                 boxShadow: "none",
//               },

//               "&:focus": {
//                 boxShadow: "none",
//               },
//             }}
//             name="comment"
//             value={formik.values.comment}
//             onChange={formik.handleChange}
//             required
//             minLength={3}
//             maxLength={300}
//             variant="outline"
//             size="1"
//             placeholder="Share your thoughts..."
//           />
//         </Flex>
//         <Button
//           size="1"
//           type="submit"
//           disabled={submitting || !formik.values.comment}
//           // css={{ alignSelf: "end" }}
//           variant="solid"
//         >
//           {submitting ? "Posting..." : "Post"}
//         </Button>
//       </Flex>

//       <Flex direction="column" css={{ mt: commentList && commentList.length > 0 ? "$5" : 0 }}>
//         {commentsData?.pages.map((infinitePage, i) => (
//           <React.Fragment key={i}>
//             {infinitePage.data
//               .map((comment, i) => (
//                 <TrackCommentItem
//                   key={comment.txid}
//                   txid={comment.txid}
//                   owner={comment.owner}
//                   published={comment.published}
//                   comment={comment.comment}
//                   // account={comment.account}
//                   ref={commentRef}
//                   isLastItem={infinitePage.data[infinitePage.data.length - 1].txid === comment.txid}
//                 />
//               ))
//               .reverse()}
//           </React.Fragment>
//         ))}
//       </Flex>
//       {commentsLoading && (
//         <Flex
//           css={{
//             my: "$10",
//             width: "100%",
//             min: 80,
//             justifyContent: "center",
//             alignItems: "center",
//           }}
//         >
//           <LoadingSpinner />
//         </Flex>
//       )}
//       {/* prevent false pagination for excluded/filtered results that are not factored into hasNextPage */}
//       {moreComments && commentList && commentList?.length > 0 && (
//         <Button
//           disabled={isFetchingNextPage}
//           variant="solid"
//           css={{
//             alignSelf: "center",
//           }}
//           onClick={() => {
//             setLoadingMore(true);
//             fetchNextPage();
//           }}
//         >
//           {isFetchingNextPage ? "Loading more comments..." : "Load more comments"}
//         </Button>
//       )}
//       {commentsError ||
//         // if there is no comment items on the first page, show no data view
//         (commentsData?.pages[0].data.length === 0 && !commentsLoading && (
//           <Flex
//             align="center"
//             css={{
//               mt: "$10",
//               "& svg": { width: "$5", height: "$5" },
//               color: "$slate11",
//             }}
//             direction="column"
//             gap="3"
//           >
//             <BsChatQuoteFill />
//             <Typography size="2" weight="6">
//               No comments yet...
//             </Typography>
//             <Typography size="1">Be the first to share your thoughts!</Typography>
//           </Flex>
//         ))}
//     </Box>
//   );
// };
