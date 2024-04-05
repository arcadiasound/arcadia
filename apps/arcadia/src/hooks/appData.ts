import { getTrackProcess } from "@/lib/library/likedTracks";
import { getProfile, getProfileProcess } from "@/lib/user/profile";
import { useQuery } from "@tanstack/react-query";
import { useActiveAddress } from "arweave-wallet-kit";

interface UserProfileProps {
  address: string | undefined;
}

export const useGetUserProfile = (props: UserProfileProps) => {
  const { data: profileProcess } = useQuery({
    queryKey: ["process", props.address, { type: "profile" }],
    queryFn: () => getProfileProcess(props.address),
    refetchOnWindowFocus: false,
    enabled: !!props.address,
  });

  const processId = profileProcess?.length ? profileProcess[0].node.id : "";

  return useQuery({
    queryKey: ["profile", props.address],
    enabled: !!props.address && !!processId,
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
    // onSuccess: (data) => {
    //   if (data && data.length) {
    //     saveProcessId({ type: "likedTracks", id: data ? data[0].node.id : "" });
    //   }
    // },
    onError: (error) => console.error(error),
  });

// const resId = res.data && res.data.length > 0 ? res.data[0].node.id : "";

// return {
//   id: resId,
//   exists: res.isSuccess && res.data && res.data.length === 0 ? false : true,
// };
