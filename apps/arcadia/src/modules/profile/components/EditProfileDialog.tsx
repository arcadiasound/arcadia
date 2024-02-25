import { appConfig } from "@/config";
import { css } from "@/styles/css";
import { Profile } from "@/types";
import {
  DialogRoot,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogTrigger,
  Separator,
  IconButton,
  Flex,
  Box,
  AspectRatio,
  Avatar,
  TextField,
  Text,
  TextArea,
  Button,
  CalloutRoot,
  CalloutIcon,
  CalloutText,
  Link,
  ScrollArea,
  Inset,
} from "@radix-ui/themes";
import { RxCamera, RxCheckCircled, RxCross2, RxExclamationTriangle } from "react-icons/rx";
import BoringAvatar from "boring-avatars";
import { styled } from "@stitches/react";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { z, ZodError } from "zod";
import { BsCamera } from "react-icons/bs";
import * as Form from "@radix-ui/react-form";
import { gateway } from "@/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setProfile } from "@/lib/profile/setProfile";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import Avvvatars from "avvvatars-react";

const StyledAvatar = styled(Avatar);

const StyledForm = styled(Form.Root, {
  /* default styles cause small white square to show */
  ".rt-TextFieldInput:where(.rt-variant-surface) + :where(.rt-TextFieldChrome)": {
    boxShadow: "none",
  },
});

const AlphaIconButton = styled(IconButton, {
  color: "var(--white-a8)",

  "& svg": {
    width: 12,
    height: 12,
  },

  "&:hover": {
    color: "var(--white-a12)",
  },

  variants: {
    liked: {
      true: {
        color: "var(--accent-9)",
        "&:hover": {
          backgroundColor: "var(--white-a4)",
          color: "var(--accent-10)",
        },
      },
    },
  },
});

const userProfile = z.object({
  name: z.string().min(3),
  handle: z.string(),
  bio: z.string(),
  avatar: z.custom<File>(),
  banner: z.custom<File>(),
});

type UserProfile = z.infer<typeof userProfile>;

const HiddenInput = styled(TextField.Input, {
  width: 0.1,
  height: 0.1,
  opacity: 0,
  overflow: "hidden",
  position: "absolute",
  zIndex: -1,

  display: "none",
});

const InputContainer = styled(Flex, {
  "& > button": {
    opacity: 0,
  },

  "&:hover": {
    "& > button": {
      opacity: 1,
    },
  },
});

const BANNER_HEIGHT = 128;
const BannerContainer = Box;

const AvatarContainer = Box;
const AVATAR_SIZE = 96;

interface EditProfileDialogProps {
  address: string;
  hasProfile: boolean | undefined;
  profile: Profile | undefined;
  children: React.ReactNode;
}

export const EditProfileDialog = (props: EditProfileDialogProps) => {
  const [open, setOpen] = useState(false);
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string>();
  const [localBannerUrl, setLocalBannerUrl] = useState<string>();
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);
  const [formErrors, setFormErrors] = useState<UserProfile | {}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const [name, setName] = useState(props.profile?.name || "");
  const [handle, setHandle] = useState(props.profile?.handle || "");
  const [bio, setBio] = useState(props.profile?.bio || "");

  useEffect(() => {
    console.log(props.profile);
  }, []);

  const bannerUrl = gateway() + "/" + props.profile?.bannerId;
  const avatarUrl = gateway() + "/" + props.profile?.avatarId;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: "avatar" | "banner") => {
    const fileObj = e.target.files && e.target.files[0];

    if (!fileObj) {
      return;
    }

    const reader = new FileReader();

    reader.readAsArrayBuffer(fileObj);

    reader.onload = () => {
      let blob;
      blob = new Blob([fileObj], { type: fileObj.type });
      let url = window.URL.createObjectURL(blob);

      if (type === "avatar") {
        setLocalAvatarUrl(url);
      } else {
        setLocalBannerUrl(url);
      }
    };
  };

  useEffect(() => {
    if (bannerUrl) {
      console.log(bannerUrl);
    }
  }, [bannerUrl]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
      const res = userProfile.parse(data);
      // Reset errors if successful
      setFormErrors({});

      console.log(res);

      profileMutation.mutate({
        values: res,
        profile: props.profile,
        address: props.address,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        // Map Zod errors to form fields
        const newErrors = error.issues.reduce((acc, currentIssue) => {
          acc[currentIssue.path[0]] = currentIssue.message;
          return acc;
        }, {});

        setFormErrors(newErrors);
      } else {
        console.error(error);
      }
    }
  };

  const debounceSuccess = useDebounce(() => {
    setIsSubmitting(false);
    localStorage.setItem("invalidate-profile-query", `profile-${props.address}`);
    queryClient.invalidateQueries({ queryKey: [`profile-${props.address}`] });
    setLocalAvatarUrl("");
    setLocalBannerUrl("");
    toast.success("Profile updated", {
      style: css({
        padding: "var(--space-3)",
        borderRadius: "max(var(--radius-2), var(--radius-full))",
        bottom: appConfig.playerMaxHeight,
      }),
    });
    setOpen(false);
  }, 750);

  const profileMutation = useMutation({
    mutationFn: setProfile,
    onSuccess: (data) => debounceSuccess(),
    onError: (error: any) => {
      document.body.style.pointerEvents = "none";
      setIsSubmitting(false);
      // setAvatarUrl("");
      // setBannerUrl("");
      // toast.error(
      //   `An error occured ${
      //     profile?.hasProfile ? "updating" : "creating"
      //   } your profile. `,
      //   {
      //     description: "Please try again.",
      //   }
      // );
      // onClose();
    },
  });

  const createText = isSubmitting ? "Creating" : "Create";
  const updateText = isSubmitting ? "Updating" : "Update";

  return (
    <DialogRoot open={open} onOpenChange={setOpen}>
      <DialogTrigger>{props.children}</DialogTrigger>
      <DialogContent
        style={css({ position: "relative", minHeight: 400, maxWidth: 500, overflow: "hidden" })}
        // a11y - bcoz not using description
        aria-describedby={undefined}
      >
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogClose>
          <IconButton
            color="gray"
            variant="soft"
            style={css({
              position: "absolute",
              right: "var(--space-4)",
              top: "var(--space-4)",
            })}
          >
            <RxCross2 />
          </IconButton>
        </DialogClose>

        <StyledForm onSubmit={handleSubmit}>
          <Flex direction="column" gap="5" mt="4">
            <BannerContainer
              mx="-5"
              width="100%"
              style={css({ height: BANNER_HEIGHT })}
              position="absolute"
            >
              <AspectRatio ratio={16 / 9}>
                <Avatar
                  radius="none"
                  src={localBannerUrl || bannerUrl}
                  alt="Profile banner"
                  fallback={
                    <Box
                      position="absolute"
                      inset="0"
                      style={css({ backgroundColor: "var(--gray-3)" })}
                    />
                  }
                  style={css({
                    width: "100%",
                    height: BANNER_HEIGHT,
                    objectFit: "cover",
                    filter: "brightness(0.85)",
                  })}
                />
              </AspectRatio>
              <InputContainer
                justify="center"
                align="center"
                position="absolute"
                left="0"
                right="0"
                top="0"
                bottom="0"
                m="auto"
              >
                <HiddenInput
                  ref={bannerInputRef}
                  onChange={(e) => handleFileChange(e, "banner")}
                  name="banner"
                  type="file"
                  accept={"image/jpeg, image/png, image/webp, image/avif"}
                />
                <AlphaIconButton
                  onClick={() => bannerInputRef.current?.click()}
                  size="4"
                  color="gray"
                  variant="ghost"
                  type="button"
                  css={{
                    color: "var(--white-a12)",
                    backgroundColor: "var(--white-a3)",
                    backdropFilter: "blur(2px)",

                    "&:hover": {
                      backgroundColor: "var(--white-a4)",
                    },

                    "& svg": {
                      width: 16,
                      height: 16,
                    },
                  }}
                >
                  <BsCamera />
                </AlphaIconButton>
              </InputContainer>
            </BannerContainer>
            <Flex align="center" mt="9" mb="3">
              <AvatarContainer mt="4" style={{ position: "relative" }}>
                <StyledAvatar
                  radius="full"
                  variant="solid"
                  size="7"
                  src={localAvatarUrl || avatarUrl}
                  fallback={
                    <Avvvatars style="shape" value={props.address} size={AVATAR_SIZE} radius={0} />
                  }
                  style={css({
                    filter: "brightness(0.85)",
                  })}
                  css={{
                    overflow: "hidden",
                    ".rt-AvatarFallback > div": {
                      borderRadius: 0,
                    },
                  }}
                />
                <InputContainer
                  justify="center"
                  align="center"
                  position="absolute"
                  left="0"
                  right="0"
                  top="0"
                  bottom="0"
                  m="auto"
                >
                  <HiddenInput
                    ref={avatarInputRef}
                    onChange={(e) => handleFileChange(e, "avatar")}
                    name="avatar"
                    type="file"
                    accept={"image/jpeg, image/png, image/webp, image/avif"}
                  />
                  <AlphaIconButton
                    onClick={() => avatarInputRef.current?.click()}
                    size="3"
                    color="gray"
                    variant="ghost"
                    type="button"
                    css={{
                      color: "var(--white-a12)",
                      backgroundColor: "var(--white-a3)",
                      backdropFilter: "blur(2px)",

                      "&:hover": {
                        backgroundColor: "var(--white-a4)",
                      },

                      "& svg": {
                        width: 16,
                        height: 16,
                      },
                    }}
                  >
                    <BsCamera />
                  </AlphaIconButton>
                </InputContainer>
              </AvatarContainer>
            </Flex>
            <Inset>
              <ScrollArea scrollbars="vertical" style={css({ maxHeight: 280 })}>
                <Flex direction="column" gap="3" p="5">
                  <Flex direction="column" gap="1">
                    <Form.Field name="name">
                      <Flex
                        style={css({ alignItems: "baseline", justifyContent: "space-between" })}
                      >
                        <Form.Label asChild>
                          <Text weight="medium" size="2">
                            Name
                          </Text>
                        </Form.Label>
                      </Flex>
                      <Form.Control asChild>
                        <TextField.Input
                          name="name"
                          type="text"
                          maxLength={20}
                          value={name || props.profile?.name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Add your name"
                          autoComplete="off"
                          variant="soft"
                          color="gray"
                        />
                      </Form.Control>
                    </Form.Field>
                  </Flex>
                  <Flex direction="column" gap="1">
                    <Text weight="medium" size="2">
                      Handle
                    </Text>
                    <TextField.Root>
                      <TextField.Slot>@</TextField.Slot>
                      <TextField.Input
                        name="handle"
                        type="text"
                        maxLength={20}
                        value={handle || props.profile?.handle}
                        onChange={(e) => setHandle(e.target.value)}
                        placeholder="Add your handle"
                        variant="soft"
                        color="gray"
                      />
                    </TextField.Root>
                  </Flex>
                  <Flex direction="column" gap="1">
                    <Text weight="medium" size="2">
                      Bio
                    </Text>
                    <TextArea
                      name="bio"
                      maxLength={160}
                      value={bio || props.profile?.bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="About me..."
                      variant="soft"
                      color="gray"
                    />
                  </Flex>
                </Flex>
              </ScrollArea>
            </Inset>
            <Box>
              <Box style={css({ height: 1, backgroundColor: "var(--gray-5)" })} mx="-5" mb="5" />
              {profileMutation.isError && (
                <CalloutRoot color="red" role="alert" size="1">
                  <CalloutIcon>
                    <RxExclamationTriangle />
                  </CalloutIcon>
                  <CalloutText size="1">
                    An error occurred trying to {props.hasProfile ? "update" : "create"} your
                    profile. Please try again or{" "}
                    <Link href="https://discord.gg/kBZeUwBebJ">contact support</Link>.
                  </CalloutText>
                </CalloutRoot>
              )}
              <Flex justify="end" gap="2" mt="4">
                <DialogClose type="button">
                  <Button variant="soft" color="gray">
                    Cancel
                  </Button>
                </DialogClose>
                <Button disabled={isSubmitting} type="submit">
                  {/* {props.hasProfile ? updateText : createText} Profile */}
                  {/* {isSubmitting && "..."} */}
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </Flex>
            </Box>
          </Flex>
        </StyledForm>
      </DialogContent>
    </DialogRoot>
  );
};
