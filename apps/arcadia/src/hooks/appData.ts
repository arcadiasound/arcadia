import { getTrackProcess } from "@/lib/library/likedTracks";
import { getProfile } from "@/lib/profile/getProfile";
import { GetUserProfileProps } from "@/types";
import { getProcessId, saveProcessId } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useActiveAddress } from "arweave-wallet-kit";

export const useGetUserProfile = (props: GetUserProfileProps) =>
  useQuery({
    queryKey: [`profile-${props.address}`],
    enabled: !!props.address,
    refetchOnWindowFocus: !!localStorage.getItem("invalidate-profile-query") ? true : false,
    refetchInterval: (data, query) =>
      !!localStorage.getItem("invalidate-profile-query") ? 1000 : 6000,
    queryFn: () => getProfile({ address: props.address }),
    onSuccess: (data) => {
      localStorage.removeItem("invalidate-profile-query");
    },
  });

export const useIsUserMe = (address: string | undefined) => {
  const activeAddress = useActiveAddress();

  return activeAddress && activeAddress === address ? true : false;
};

export const useGetProcessId = (address: string | undefined) => {
  const id = getProcessId(`likedTracks-${address}`);

  const res = useQuery({
    queryKey: [`likedTracksProcess`, address],
    queryFn: async () => {
      if (!address) return;

      const res = await getTrackProcess(address);

      if (res && res.length) {
        return res;
      } else {
        return [];
      }
    },
    enabled: !!address,
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      if (data && data.length) {
        saveProcessId({ type: "likedTracks", id: data ? data[0].node.id : "" });
      }
    },
    onError: (error) => console.error(error),
  });

  const resId = res.data && res.data.length > 0 ? res.data[0].node.id : "";

  return {
    id: id || resId,
    exists: !id && res.isSuccess && res.data && res.data.length === 0 ? false : true,
  };
};
