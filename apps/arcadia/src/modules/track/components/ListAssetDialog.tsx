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
import { FormHelperError, FormRow } from "@/ui/Form";
import { TextField } from "@/ui/TextField";
import { Button } from "@/ui/Button";
import { FormikErrors, useFormik } from "formik";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { listAsset } from "@/lib/asset/listAsset";

interface ListAssetFormProps {
  units: number;
  price: number;
}

interface ListAssetDialogProps {
  open: boolean;
  onClose: () => void;
  address: string;
  track: Track;
  creatorName: string;
  ucmAsset: UCMAssetProps;
}

export const ListAssetDialog = ({
  open,
  onClose,
  address,
  track,
  creatorName,
  ucmAsset,
}: ListAssetDialogProps) => {
  const queryClient = useQueryClient();

  const balance = ucmAsset.state.balances[address];

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

  const listAssetMutation = useMutation({
    mutationFn: listAsset,
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

  const formik = useFormik<ListAssetFormProps>({
    initialValues: {
      units: 0,
      price: 0,
    },
    validate: (values) => {
      let errors: FormikErrors<ListAssetFormProps> = {};

      if (values.units > balance) {
        errors.units = "Units to sell must be equal to or lower than balance";
      }
    },
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: (values) => {
      listAssetMutation.mutate({
        address,
        assetId: track.txid,
        price: values.price,
        qty: values.units,
      });
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        listAssetMutation.reset();
        onClose();
      }}
    >
      <DialogOverlay />
      <DialogContent>
        {listAssetMutation.isSuccess ? (
          <Flex
            css={{ my: "$20", height: "100%" }}
            direction="column"
            align="center"
            gap="5"
          >
            <Box
              css={{
                color: "$green9",
                "& svg": {
                  boxSize: "$10",
                },
              }}
            >
              <RxCheckCircled />
            </Box>
            <Typography as="h2" size="5">
              Listing submitted
            </Typography>
            <Typography>
              Your listing is being processed and will be visible shortly.
            </Typography>
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
                  Sell ownership
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
                <Typography>{creatorName}</Typography>
              </Flex>
            </Flex>
            <Typography contrast="hi">
              You own {balance} units of this song (
              {Math.round(
                getOwnershipPercentage(balance, ucmAsset.state.balances)
              )}
              %)
            </Typography>
            <Box
              css={{
                height: 1,
                backgroundColor: "$slate3",
                mx: "-$5",
                mt: "$5",
              }}
            />
            <Box as="form" onSubmit={formik.handleSubmit}>
              <FormRow
                css={{
                  mt: "$5",
                }}
              >
                <Typography
                  as="label"
                  htmlFor="units"
                  size="2"
                  css={{
                    position: "relative",
                  }}
                >
                  Units to sell
                  <Typography
                    as="span"
                    size="1"
                    css={{ position: "absolute", right: 0 }}
                  >
                    (Max. {balance})
                  </Typography>
                </Typography>
                <TextField
                  value={formik.values.units}
                  onChange={formik.handleChange}
                  name="units"
                  type="number"
                  min={1}
                  max={balance}
                  placeholder="# of units"
                  variant="outline"
                  size="3"
                />
                {formik.errors.units && (
                  <FormHelperError>{formik.errors.units}</FormHelperError>
                )}
              </FormRow>
              <FormRow>
                <Typography as="label" htmlFor="price" size="2">
                  Price per unit ($U)
                </Typography>
                <TextField
                  value={formik.values.price}
                  onChange={formik.handleChange}
                  name="price"
                  type="number"
                  min={1}
                  max={balance}
                  placeholder="Set a price"
                  variant="outline"
                  size="3"
                />
                {formik.errors.price && (
                  <FormHelperError>{formik.errors.price}</FormHelperError>
                )}
              </FormRow>
              {formik.values.units > 0 && (
                <>
                  <Box
                    css={{
                      height: 1,
                      backgroundColor: "$slate3",
                      mx: "-$5",
                      mb: "$5",
                    }}
                  />
                  <Flex direction="column" gap="3">
                    <Flex
                      css={{ backgroundColor: "$slate3", p: "$3", br: "$1" }}
                      justify="between"
                      align="center"
                    >
                      <Typography contrast="hi" size="2">
                        You will receive:
                      </Typography>
                      <Typography contrast="hi" size="2">
                        {(formik.values.units * formik.values.price).toFixed(3)}{" "}
                        U
                      </Typography>
                    </Flex>
                    <Typography contrast="hi" size="1">
                      You will own {balance - formik.values.units} units of this
                      song after listing (
                      {Math.round(
                        getOwnershipPercentage(
                          balance - formik.values.units,
                          ucmAsset.state.balances
                        )
                      )}
                      %)
                    </Typography>
                  </Flex>
                </>
              )}
              <Box
                css={{
                  height: 1,
                  backgroundColor: "$slate3",
                  mx: "-$5",
                  my: "$3",
                }}
              />
              {listAssetMutation.isError &&
                listAssetMutation.error instanceof Error && (
                  <Typography css={{ color: "$red11", mb: "$3" }} size="1">
                    {listAssetMutation.error.message}
                  </Typography>
                )}
              <Button
                disabled={
                  formik.isSubmitting ||
                  listAssetMutation.isLoading ||
                  !formik.values.price ||
                  !formik.values.units
                }
                variant="solid"
                css={{ width: "100%" }}
                type="submit"
              >
                {formik.isSubmitting || listAssetMutation.isLoading
                  ? "Creating listing..."
                  : "Complete listing"}
              </Button>
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
