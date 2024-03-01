import { getProfile } from "@/lib/profile/getProfile";
import { GetUserProfileProps } from "@/types";
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
