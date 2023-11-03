import { forwardRef, useEffect } from "react";
import { Flex } from "@/ui/Flex";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { IconButton, IconButtonVariants } from "@/ui/IconButton";
import { Typography } from "@/ui/Typography";
import { getStampCount, hasStampedTx, stamp } from "@/lib/stamps";
import { BsSuitHeart, BsSuitHeartFill } from "react-icons/bs";
import { ConnectPrompt } from "../../layout/ConnectPrompt";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/ui/Button";
import { useConnect } from "@/hooks/useConnect";

interface LikeButtonProps extends IconButtonVariants {
  txid: string | null | undefined;
  //   disabled?: boolean;
}

export const LikeButton = forwardRef<HTMLButtonElement, LikeButtonProps>(
  ({ txid, ...props }: LikeButtonProps, ref) => {
    const [showConnectPrompt, setShowConnectPrompt] = useState(false);
    // local state for instant visual feedback
    const [localStamped, setLocalStamped] = useState(false);
    // local stamp count for instant visual feedback
    const [localStampCount, setLocalStampCount] = useState(0);
    // temp solution, connect method from sdk should prob return a promise
    const [userConnect, setUserConnect] = useState(false);

    const { walletAddress, connect } = useConnect();

    const handleShowConnectPrompt = () => setShowConnectPrompt(true);
    const handleCancelConnectPrompt = () => setShowConnectPrompt(false);

    useEffect(() => {
      if (walletAddress && userConnect && txid) {
        setUserConnect(false);
        handleCancelConnectPrompt();
        mutation.mutate(txid);
        setLocalStamped(true);
      }
    }, [walletAddress]);

    // const { data: stamps } = useQuery({
    //   queryKey: [`stampCount-${txid}`],
    //   refetchOnWindowFocus: false,
    //   queryFn: () => {
    //     if (!txid) {
    //       throw new Error("No track ID has been found");
    //     }

    //     return getStampCount(txid);
    //   },
    //   onError: (error) => {
    //     console.error(error);
    //   },
    // });

    const { data: stamped, refetch } = useQuery({
      queryKey: [`stamped-${txid}`],
      enabled: !!walletAddress,
      queryFn: () => {
        if (!txid) {
          throw new Error("No track ID has been found");
        }

        if (!walletAddress) {
          throw new Error("No wallet address found");
        }

        return hasStampedTx(txid, walletAddress);
      },
      onSuccess: (data) => {
        console.log(data);
        setLocalStamped(false);
      },
      onError: (error) => {
        console.error(error);
      },
    });

    const debounceRequest = useDebounce(() => {
      refetch();
    }, 450);

    const mutation = useMutation({
      mutationFn: stamp,
      //@ts-ignore
      onSuccess: () => {
        debounceRequest();
        // if (stamps) {
        //   setLocalStampCount(stamps.total + 1);
        // }
      },
      onError: (error: any) => {
        console.error(error);
        setLocalStamped(false);
      },
    });

    const handleStamp = () => {
      if (!txid || stamped || localStamped) {
        return;
      }

      if (walletAddress) {
        setLocalStamped(true);
        mutation.mutate(txid);
      } else {
        handleShowConnectPrompt();
      }
    };

    const handleConnectAndStamp = async () => {
      if (!txid || stamped) {
        return;
      }

      /* as we can't await below connect method we need to check
              if user tried to connect and use presence of this state var and walletAddress to initiate like
              and close dialog
            */

      connect({ appName: "Arcadia", walletProvider: "arweave.app" });

      setUserConnect(true);
    };

    return (
      <Flex align="center">
        <IconButton
          ref={ref}
          {...props}
          disabled={!txid || !stamp || stamped}
          css={{
            "& svg": {
              color: stamped ? "$red9" : "$slate11",
            },

            "&:hover": {
              "& svg": {
                color: stamped ? "$red9" : "$slate12",
              },
            },

            "&:disabled": {
              opacity: 1,
            },

            '&[aria-disabled="true"]': {
              opacity: 1,
            },
          }}
          onClick={handleStamp}
          variant="transparent"
        >
          {stamped ? <BsSuitHeartFill /> : <BsSuitHeart />}
        </IconButton>
        {/* {stamps && <Typography>{localStampCount || stamps.total}</Typography>} */}

        <ConnectPrompt
          open={showConnectPrompt}
          onClose={handleCancelConnectPrompt}
          title="Connect your wallet to proceed"
          description="In order to perform this action, you need to connect an Arweave
                      wallet."
        >
          <Button
            onClick={handleConnectAndStamp}
            css={{
              mt: "$5",
            }}
            variant="solid"
          >
            Connect and Like
            <BsSuitHeartFill />
          </Button>
        </ConnectPrompt>
      </Flex>
    );
  }
);
