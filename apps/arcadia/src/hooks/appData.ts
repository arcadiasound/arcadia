import { getTrackProcess } from "@/lib/library/likedTracks";
import { followUser, unfollowUser } from "@/lib/user/follow";
import { getProfile, getProfileProcess } from "@/lib/user/profile";
import { AOProfile } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActiveAddress } from "arweave-wallet-kit";

interface UserProfileProps {
  address?: string;
  processId?: string;
}

export const useGetUserProfile = (props: UserProfileProps) => {
  const { data: profileProcess } = useQuery({
    queryKey: ["process", props.address, { type: "profile" }],
    queryFn: () => getProfileProcess(props.address),
    refetchOnWindowFocus: false,
    enabled: !!props.address && !props.processId,
  });

  // instead pass props.processId to getProfileProcess, so we can extract owner address for below query
  const processId = props.processId
    ? props.processId
    : profileProcess?.length
    ? profileProcess[0].node.id
    : "";

  return useQuery({
    queryKey: ["profile", processId],
    enabled: !!processId,
    queryFn: async () => {
      if (!processId) return;

      return getProfile({ processId: processId });
    },
    // onSuccess: (data) => {
    //   console.log("profile: ", { data });
    // },
    // refetchInterval: 5000,
  });
};

export const useIsUserMe = (address: string | undefined) => {
  const activeAddress = useActiveAddress();

  return activeAddress && activeAddress === address ? true : false;
};

export const useGetProcessId = (address: string | undefined) =>
  useQuery({
    queryKey: [`likedTracksProcess`, address],
    queryFn: async () => {
      if (!address) return;

      const res = await getTrackProcess(address);

      if (res && res.length) {
        return {
          id: res[0].node.id,
          exists: true,
        };
      } else {
        return {
          id: "",
          exists: false,
        };
      }
    },
    enabled: !!address,
    refetchOnWindowFocus: false,
    onError: (error) => console.error(error),
  });

interface FollowUserProps {
  address: string;
}

export const useFollowUser = (props: FollowUserProps) => {
  const { address } = props;
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: followUser,
    onMutate: async (data) => {
      // prevent overwriting optimistic update
      await queryClient.cancelQueries({
        queryKey: ["profile", data.target],
      });

      // snapshot prev value
      const prevProfile = queryClient.getQueryData<AOProfile>(["profile", data.target]);

      // optimistically update
      queryClient.setQueryData<AOProfile>(["profile", data.target], (oldProfile) => {
        return {
          Owner: oldProfile?.Owner || address,
          Info: oldProfile?.Info || { name: "", handle: "", bio: "", avatar: "", banner: "" },
          Followers: oldProfile?.Followers ? [...oldProfile.Followers, data.sender] : [data.sender],
          Following: oldProfile?.Following || [],
        };
      });

      // return ctx obj with snapshot
      return { prevProfile };
    },
    onSettled: (res, err, data) => {
      queryClient.invalidateQueries({
        queryKey: ["profile", data.target],
      });
    },
    onError: (error, data, ctx: any) => {
      queryClient.setQueryData(["profile", data.target], ctx.prevProfile);
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: unfollowUser,
    onMutate: async (data) => {
      await queryClient.cancelQueries({
        queryKey: ["profile", data.target],
      });

      const prevProfile = queryClient.getQueryData<AOProfile>(["profile", data.target]);

      queryClient.setQueryData<AOProfile>(["profile", data.target], (oldProfile) => {
        return {
          Owner: oldProfile?.Owner || address,
          Info: oldProfile?.Info || { name: "", handle: "", bio: "", avatar: "", banner: "" },
          Followers: oldProfile?.Followers?.filter((follower) => follower !== data.sender) || [],
          Following: oldProfile?.Following || [],
        };
      });

      return { prevProfile };
    },
    onSettled: (res, err, data) => {
      queryClient.invalidateQueries({
        queryKey: ["profile", data.target],
      });
    },
    onError: (error, data, ctx: any) => {
      queryClient.setQueryData(["profile", data.target], ctx.prevProfile);
    },
  });

  const isLoading = followMutation.isLoading || unfollowMutation.isLoading;

  return { follow: followMutation, unfollow: unfollowMutation, isLoading };
};
