import { sendMessage } from "../ao";

interface FollowUser {
  target: string;
  sender: string;
}

export const followUser = async (props: FollowUser) => {
  const { target, sender } = props;

  try {
    const messageId = await sendMessage({
      // user initializes flow by sending follow action to their own process
      processId: sender,
      action: "Follow",
      data: target,
    });

    return messageId;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const unfollowUser = async (props: FollowUser) => {
  const { target, sender } = props;

  try {
    const messageId = await sendMessage({
      // user initializes flow by sending unfollow action to their own process
      processId: sender,
      action: "Unfollow",
      data: target,
    });

    return messageId;
  } catch (error: any) {
    throw new Error(error);
  }
};
