import { getProfile } from "@/lib/getProfile";
import { Track } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { BsSuitHeart } from "react-icons/bs";
import { IoPlay } from "react-icons/io5";
import { Flex } from "@/ui/Flex";
import { Typography } from "@/ui/Typography";
import { Image } from "@/ui/Image";
import { Box } from "@/ui/Box";
import { appConfig } from "@/appConfig";
import { IconButton } from "@/ui/IconButton";
import { RxDotsHorizontal } from "react-icons/rx";
import { abbreviateAddress } from "@/utils";
import { useEffect } from "react";
import { Link } from "react-router-dom";

interface FeaturedTrackItemProps {
  track: Track;
}

export const FeaturedTrackItem = ({ track }: FeaturedTrackItemProps) => {
  const { data: creator } = useQuery({
    queryKey: [`profile-${track.creator}`],
    enabled: !!track.creator,
    queryFn: () => {
      if (!track.creator) {
        return;
      }

      return getProfile(track.creator);
    },
  });

  useEffect(() => {
    console.log({ track });
  }, []);

  return (
    <Flex
      key={track.txid}
      css={{
        width: "100%",
        maxHeight: "48dvh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Image
        css={{
          width: "100%",
          height: "100%",
          aspectRatio: 4 / 3,
          objectFit: "cover",
          objectPosition: "bottom",
        }}
        src={`${appConfig.defaultGateway}/${track.artworkId}`}
      />
      <Box
        css={{
          position: "absolute",
          inset: 0,
          backgroundColor: "$blackA9",
          backdropFilter: "blur(20px)",
        }}
      />
      <Flex
        css={{
          zIndex: 0,
          position: "absolute",
          inset: 0,
        }}
        align="center"
        gap="10"
        justify="center"
      >
        <Link
          to={{
            pathname: "/track",
            search: `?tx=${track.txid}`,
          }}
        >
          <Image
            css={{
              width: 300,
              height: 300,
              outline: "4px solid $whiteA4",
              outlineOffset: -4,
            }}
            src={`${appConfig.defaultGateway}/${track.artworkId}`}
          />
        </Link>
        <Flex css={{ zIndex: 1 }} direction="column" gap="7">
          <Link
            to={{
              pathname: "/track",
              search: `?tx=${track.txid}`,
            }}
          >
            <Typography size="6" weight="5" css={{ color: "$whiteA12" }}>
              {track.title}
            </Typography>
            <Typography weight="5" css={{ color: "$whiteA11" }}>
              {creator
                ? creator.profile.name
                : abbreviateAddress({
                    address: track.creator,
                  })}
            </Typography>
          </Link>
          <Link
            to={{
              pathname: "/track",
              search: `?tx=${track.txid}`,
            }}
          >
            <Typography css={{ maxWidth: "40ch", color: "$whiteA11" }} size="2">
              {track.description || "-"}
            </Typography>
          </Link>
          <Flex gap="5">
            <IconButton size="3" variant="solid" rounded>
              <IoPlay />
            </IconButton>
            <IconButton size="3" variant="translucent" rounded>
              <BsSuitHeart />
            </IconButton>
            <IconButton size="3" variant="translucent" rounded>
              <RxDotsHorizontal />
            </IconButton>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};
