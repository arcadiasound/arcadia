import { css } from "@/styles/css";
import { ProfileInfo } from "@/types";
import {
  DialogRoot,
  DialogContent,
  DialogTitle,
  DialogClose,
  DialogTrigger,
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
import { RxCross2, RxExclamationTriangle } from "react-icons/rx";
import { styled } from "@stitches/react";
import { ChangeEvent, useRef, useState } from "react";
import { z, ZodError } from "zod";
import { BsCamera } from "react-icons/bs";
import * as Form from "@radix-ui/react-form";
import { gateway, sleep } from "@/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import Avvvatars from "avvvatars-react";
import { createProfileProcess, getProfileProcess, updateProfile } from "@/lib/user/profile";

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

const userProfile = z.object({
  name: z.string().min(3),
  handle: z.string(),
  bio: z.string().max(150).optional(),
  avatar: z.custom<File>().optional(),
  banner: z.custom<File>().optional(),
});

type UserProfile = z.infer<typeof userProfile>;

interface EditProfileDialogProps {
  address: string;
  noProfile: boolean;
  profile: ProfileInfo | undefined;
  children: React.ReactNode;
}

export const EditProfileDialog = (props: EditProfileDialogProps) => {
  const [open, setOpen] = useState(false);
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string>();
  const [localBannerUrl, setLocalBannerUrl] = useState<string>();
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<UserProfile>({
    name: props.profile?.name || "",
    handle: props.profile?.handle || "",
    bio: props.profile?.bio || "",
  });
  const [formErrors, setFormErrors] = useState<UserProfile | {}>({});
  const queryClient = useQueryClient();

  const { data: processRes } = useQuery({
    queryKey: [`profileProcess`, props.address],
    queryFn: () => getProfileProcess(props.address),
    enabled: !!props.address,
  });

  const bannerUrl = gateway() + "/" + props.profile?.banner;
  const avatarUrl = gateway() + "/" + props.profile?.avatar;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
      setIsSubmitting(true);

      const values = userProfile.parse(data);
      // Reset errors if successful
      setFormErrors({});

      if (processRes?.length) {
        const processId = processRes[0].node.id;
        profileMutation.mutate({
          processId,
          values,
          profile: props.profile,
        });
      } else {
        try {
          const processId = await createProfileProcess({ owner: props.address });

          if (processId) {
            profileMutation.mutate({
              processId,
              values,
              profile: props.profile,
            });
          } else {
            throw new Error("No process ID found");
          }
        } catch (error: any) {
          throw new Error(error);
        }
      }
    } catch (error) {
      setIsSubmitting(false);
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

  const profileMutation = useMutation({
    mutationFn: updateProfile,
    // set context state optimistically
    onMutate: async (newProfile) => {
      // prevent overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ["profile", props.address] });

      // snapshot prev value
      const prevProfile = queryClient.getQueryData<ProfileInfo>(["profile", props.address]);

      // optimistically update
      queryClient.setQueryData(["profile", props.address], {
        ...prevProfile,
        ...newProfile.profile,
      });

      // return ctx obj with snapshot
      return { prevProfile };
    },
    onSuccess: (data) => {
      // debounceSuccess();
      queryClient.invalidateQueries({ queryKey: ["profile", { owner: props.address }] });
      setLocalAvatarUrl("");
      setLocalBannerUrl("");
      toast.success("Profile updated");
      setOpen(false);
    },
    onError: (error: any, newTodo, ctx: any) => {
      document.body.style.pointerEvents = "none";
      console.error(error);

      if (ctx) {
        queryClient.setQueryData(["profile", props.address], ctx.previousTodos);
      }
    },
    onSettled: () => {
      setIsSubmitting(false);

      queryClient.invalidateQueries({
        queryKey: ["profile", props.address],
      });
      queryClient.invalidateQueries({
        queryKey: ["process", props.address, { type: "profile" }],
      });
    },
  });

  const submittingText = props.noProfile ? "Creating" : "Saving";
  const submitText = props.noProfile ? "Create" : "Save";

  return (
    <DialogRoot open={open} onOpenChange={setOpen}>
      <DialogTrigger>{props.children}</DialogTrigger>
      <DialogContent
        style={css({ position: "relative", minHeight: 400, maxWidth: 500, overflow: "hidden" })}
        // a11y - bcos not using description
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
                      <Form.Control minLength={2} asChild>
                        <TextField.Input
                          name="name"
                          type="text"
                          maxLength={20}
                          minLength={2}
                          value={form.name || props.profile?.name}
                          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="Add your name"
                          autoComplete="off"
                          variant="soft"
                          color="gray"
                          required
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
                        value={form.handle || props.profile?.handle}
                        onChange={(e) => setForm((prev) => ({ ...prev, handle: e.target.value }))}
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
                      value={form.bio || props.profile?.bio}
                      onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
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
                    An error occurred trying to update your profile. Please try again or{" "}
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
                <Button disabled={isSubmitting || !form.name || !form.handle} type="submit">
                  {isSubmitting ? submittingText : submitText}
                </Button>
              </Flex>
            </Box>
          </Flex>
        </StyledForm>
      </DialogContent>
    </DialogRoot>
  );
};
