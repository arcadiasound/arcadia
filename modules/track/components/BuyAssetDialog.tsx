import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogTitle,
} from "@/ui/Dialog";
import { Flex } from "@/ui/Flex";
import { Typography } from "@/ui/Typography";
import { IconButton } from "@/ui/IconButton";
import { RxCheckCircled, RxCross2 } from "react-icons/rx";
import { Box } from "@/ui/Box";
import { Track, UCMAssetProps } from "@/types";
import { Image } from "@/ui/Image";
import { FormHelperError, FormHelperText, FormRow } from "@/ui/Form";
import { TextField } from "@/ui/TextField";
import { Button } from "@/ui/Button";
import { FormikErrors, useFormik } from "formik";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listAsset } from "@/lib/asset/listAsset";
import { buyAsset } from "@/lib/asset/buyAsset";
import { getTrack } from "@/lib/getTrack";
import { useAudioPlayer } from "@/hooks/AudioPlayerContext";
import { getUCMAsset } from "@/lib/getUCMAsset";
import { getProfile } from "@/lib/getProfile";
import { abbreviateAddress } from "@/utils";
import { getUBalance } from "@/lib/user/getUBalance";
import { appConfig } from "@/appConfig";
import { getActiveSaleOrders } from "@/lib/asset/getActiveSaleOrders";
import { MdError } from "react-icons/md";
import { BsHeartFill } from "react-icons/bs";

interface BuyAssetFormProps {
  spend: number;
}

interface BuyAssetDialogProps {
  open: boolean;
  onClose: () => void;
  address: string;
  track: Track;
}

export const BuyAssetDialog = ({
  open,
  onClose,
  address,
  track,
}: BuyAssetDialogProps) => {
  const queryClient = useQueryClient();
  const { audioCtxRef } = useAudioPlayer();

  const { data: ucmAsset, isLoading: ucmAssetLoading } = useQuery({
    queryKey: [`ucmAsset-${track?.txid}`],
    enabled: !!track,
    cacheTime: 0,
    refetchOnWindowFocus: false,
    queryFn: () => {
      if (!track?.txid) {
        throw new Error("No txid found");
      }

      return getUCMAsset(track.txid);
    },
  });

  const quantityForSale = ucmAsset ? ucmAsset.state.balances[appConfig.UCM] : 0;

  const { data: account } = useQuery({
    queryKey: [`profile-${track?.creator}`],
    enabled: !!track,
    queryFn: () => {
      if (!track?.creator) {
        throw new Error("No profile has been found");
      }

      return getProfile(track.creator);
    },
  });

  const { data: activeSaleOrders, isLoading: activeSaleOrdersLoading } =
    useQuery({
      queryKey: [`activeSaleOrders-${track?.txid}`],
      enabled: !!track,
      refetchOnWindowFocus: false,
      // refetchInterval: 3000,
      queryFn: () => {
        if (!track?.txid) {
          return;
        }

        return getActiveSaleOrders({ assetId: track.txid });
      },
    });

  const getTotalSalePrice = (quantity: number) => {
    if (!activeSaleOrders) {
      return 0;
    }

    let totalSalePrice = 0;

    for (const order of activeSaleOrders) {
      if (quantity <= 0) break; // Stop if user quantity is fully allocated

      // Determine how much of the current order can be used
      const quantityFromThisOrder = Math.min(order.quantity, quantity);
      totalSalePrice += order.price * quantityFromThisOrder; // Adjust total price based on this quantity
      quantity -= quantityFromThisOrder; // Subtract the allocated quantity from the remaining total
    }

    return totalSalePrice;
  };

  const { data: userUBalance, isLoading: userUBalanceLoading } = useQuery({
    queryKey: [`uBalance-${address}`],
    enabled: !!address,
    refetchOnWindowFocus: false,
    queryFn: () => {
      if (!address) {
        throw new Error("No txid found");
      }

      return getUBalance(address);
    },
  });

  const getOwnershipPercentage = (
    balance: number,
    balances: UCMAssetProps["state"]["balances"]
  ) => {
    const balancesArray = Object.values(balances);
    const totalSupply = balancesArray.reduce(function (acc, obj) {
      return acc + obj;
    }, 0);

    const percentage = (balance / totalSupply) * 100;

    return percentage;
  };

  const buyAssetMutation = useMutation({
    mutationFn: buyAsset,
    onSuccess: (data) => {
      formik.resetForm();
      setTimeout(
        () =>
          queryClient.invalidateQueries([
            `activeSaleOrders-${track.txid}`,
            `uBalance-${address}`,
            `ucmAsset-${track.txid}`,
          ]),
        500
      );
    },
    onError: (error) => {
      formik.setSubmitting(false);
    },
  });

  const formik = useFormik<BuyAssetFormProps>({
    initialValues: {
      spend: 0,
    },
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: (values) => {
      buyAssetMutation.mutate({
        address,
        assetId: track.txid,
        spend: getTotalSalePrice(values.spend),
      });
    },
  });

  const hasEnoughFunds = () => {
    const totalSalePrice = getTotalSalePrice(formik.values.spend) / 1e6;
    if (!userUBalance) {
      return false;
    }

    if (totalSalePrice < userUBalance) {
      return true;
    } else {
      return false;
    }
  };

  const isAssetOwner =
    ucmAsset && address && address in ucmAsset.state.balances ? true : false;

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        buyAssetMutation.reset();
        onClose();
      }}
    >
      <DialogOverlay />
      <DialogContent>
        {buyAssetMutation.isSuccess ? (
          <Flex
            css={{ my: "$5", height: "100%" }}
            direction="column"
            align="center"
            gap="5"
          >
            <Box
              css={{
                color: "$slate12",
                "& svg": {
                  boxSize: "$10",
                },
              }}
            >
              <RxCheckCircled />
            </Box>
            <Typography as="h2" size="5" css={{ textAlign: "center" }}>
              Congratulations! <br />{" "}
              {isAssetOwner ? "You own more" : "You're an onwer"} of{" "}
              <Typography as="span" size="5" contrast="hi">
                {track.title}
              </Typography>
            </Typography>
            <Typography
              size="1"
              css={{ maxWidth: "40ch", textAlign: "center" }}
            >
              Please give a few moments for ownership details to be updated.
            </Typography>
            <Image
              src={
                track.artworkId
                  ? `https://arweave.net/${track.artworkId}`
                  : `https://source.boringavatars.com/marble/150/${track.txid}?square=true`
              }
              css={{
                boxSize: 150,
              }}
            />
            <DialogClose asChild pos="relative">
              <Button variant="solid" size="3">
                Close
              </Button>
            </DialogClose>
          </Flex>
        ) : (
          <>
            <Flex justify="between" align="center">
              <DialogTitle asChild>
                <Typography contrast="hi" size="5" weight="5">
                  Become an owner
                </Typography>
              </DialogTitle>
              <DialogClose asChild pos="relative">
                <IconButton rounded>
                  <RxCross2 />
                </IconButton>
              </DialogClose>
            </Flex>
            <Flex
              align="center"
              gap="3"
              css={{
                my: "$5",
                p: "$3",
                br: "$2",
                boxShadow: "0 0 0 1px $colors$slate4",
              }}
            >
              <Image
                src={
                  track.artworkId
                    ? `https://arweave.net/${track.artworkId}`
                    : `https://source.boringavatars.com/marble/60/${track.txid}?square=true`
                }
                css={{
                  boxSize: 60,
                }}
              />
              <Flex direction="column" gap="1">
                <Typography contrast="hi">{track.title}</Typography>
                <Typography>
                  {account?.profile.name ||
                    abbreviateAddress({
                      address: track.creator,
                      options: { startChars: 6, endChars: 6 },
                    })}
                </Typography>
              </Flex>
            </Flex>
            {/* <Typography contrast="hi">
              You own {balance} units of this song (
              {getOwnershipPercentage(balance, ucmAsset.state.balances)}%)
            </Typography> */}
            {/* <Box
              css={{
                height: 1,
                backgroundColor: "$slate3",
                mx: "-$5",
                mt: "$5",
              }}
            /> */}
            <Box as="form" onSubmit={formik.handleSubmit}>
              <FormRow
                css={{
                  mt: "$5",
                }}
              >
                <Typography
                  as="label"
                  htmlFor="spend"
                  size="2"
                  css={{
                    position: "relative",
                  }}
                >
                  Amount
                  <Typography
                    as="span"
                    size="1"
                    css={{ position: "absolute", right: 0 }}
                  >
                    (Max. {quantityForSale})
                  </Typography>
                </Typography>
                <TextField
                  value={formik.values.spend}
                  onChange={formik.handleChange}
                  name="spend"
                  type="number"
                  min={1}
                  max={quantityForSale}
                  placeholder="# of units to buy"
                  variant="outline"
                  size="3"
                />
                {formik.errors.spend ? (
                  <FormHelperError>{formik.errors.spend}</FormHelperError>
                ) : (
                  <FormHelperText css={{ right: 0 }}>
                    Price:{" "}
                    {(getTotalSalePrice(formik.values.spend) / 1e6).toFixed(3)}{" "}
                    U
                  </FormHelperText>
                )}
              </FormRow>
              <Typography
                size="1"
                css={{
                  textAlign: "end",
                  mt: "$1",
                  color: hasEnoughFunds() ? "$slate12" : "$red11",
                }}
              >
                Your balance: {userUBalance?.toFixed(3)} U
              </Typography>
              {formik.values.spend > 0 && ucmAsset && hasEnoughFunds() && (
                <>
                  <Box
                    css={{
                      height: 1,
                      backgroundColor: "$slate3",
                      mx: "-$5",
                      my: "$5",
                    }}
                  />
                  <Flex direction="column" gap="3">
                    <Typography
                      contrast="hi"
                      size="1"
                      css={{
                        backgroundColor: "$slate3",
                        p: "$3",
                        br: "$1",
                      }}
                    >
                      You will own{" "}
                      {Math.round(
                        getOwnershipPercentage(
                          isAssetOwner
                            ? ucmAsset.state.balances[address] +
                                formik.values.spend
                            : formik.values.spend,
                          ucmAsset.state.balances
                        )
                      )}
                      % of this song after purchasing
                    </Typography>
                  </Flex>
                </>
              )}
              {!hasEnoughFunds() && (
                <FormHelperError
                  css={{
                    position: "relative",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "$1",
                    mt: "$2",
                  }}
                >
                  <MdError />
                  Insufficient funds
                </FormHelperError>
              )}
              {buyAssetMutation.isError &&
                buyAssetMutation.error instanceof Error && (
                  <Typography css={{ color: "$red11", mb: "$3" }} size="1">
                    {buyAssetMutation.error.message}
                  </Typography>
                )}
              <Button
                disabled={
                  formik.isSubmitting ||
                  buyAssetMutation.isLoading ||
                  !hasEnoughFunds()
                }
                variant="solid"
                css={{ width: "100%", mt: "$3" }}
                type="submit"
              >
                {formik.isSubmitting || buyAssetMutation.isLoading
                  ? "Completing Purchase..."
                  : "Complete purchase"}
              </Button>
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
