import { Flex } from "@/ui/Flex";
import { Typography } from "@/ui/Typography";
import { getRecentAlbums } from "@/lib/getRecentAlbums";
import { getRecentTracks } from "@/lib/getRecentTracks";
import { useQuery } from "@tanstack/react-query";
import { TrackCard } from "../track/TrackCard";
import { styled } from "@/stitches.config";
import { Skeleton } from "@/ui/Skeleton";
import { useMotionAnimate } from "motion-hooks";
import { stagger } from "motion";
import { useEffect } from "react";
import { getFeaturedTracks } from "@/lib/getFeaturedTracks";
import Carousel, { CarouselProps } from "nuka-carousel";
import { Image } from "@/ui/Image";
import { appConfig } from "@/appConfig";
import { Box } from "@/ui/Box";
import { IconButton } from "@/ui/IconButton";
import { MdPlayArrow } from "react-icons/md";
import { BsSuitHeart } from "react-icons/bs";
import { IoPlay } from "react-icons/io5";
import {
  RxArrowLeft,
  RxArrowRight,
  RxDotFilled,
  RxDotsHorizontal,
} from "react-icons/rx";

const CarouselSkipButton = styled(IconButton, {
  mx: "$5",
  backgroundColor: "$whiteA3",

  "&:hover": {
    backgroundColor: "$whiteA4",
  },

  "&:active": {
    backgroundColor: "$whiteA5",
  },
});

const spotlightItems = [
  "GP1nxVkrl4a8q7Tl3H9lFBbAQzNDYs98Aw_hJD_Xjwg",
  "eGZrD-cErnrINpHgK-swMiGOMd8HWqQ6sW_N9x1Ipao",
  "oA8nBLIAVbJ3-lie2JmszN0ZDlxP1wzQAfJGcHS-_Uk",
];

const carouselParams: CarouselProps = {
  wrapAround: true,
  dragThreshold: 0.2,
};

const TrackSkeleton = styled(Skeleton, {
  width: 200,
  height: 200,
});

export const Discover = () => {
  const { play } = useMotionAnimate(
    ".trackItem",
    { opacity: 1 },
    {
      delay: stagger(0.03),
      duration: 0.3,
      easing: "ease-in-out",
    }
  );

  const {
    data: recentTracks,
    isError,
    isLoading,
  } = useQuery({
    queryKey: [`recentTracks`],
    queryFn: () => getRecentTracks(),
  });

  useEffect(() => {
    console.log(recentTracks);
    if (recentTracks && recentTracks.length > 0) {
      play();
    }
  }, [recentTracks]);

  return (
    <Flex
      css={{
        pt: 64,
        ".trackItem": {
          opacity: 0,
        },
      }}
      direction="column"
      gap="20"
    >
      <Flex direction="column" gap="20">
        <Carousel
          renderCenterLeftControls={(control) => (
            <CarouselSkipButton
              onClick={() => control.previousSlide()}
              size="3"
              rounded
              variant="translucent"
            >
              <RxArrowLeft />
            </CarouselSkipButton>
          )}
          renderCenterRightControls={(control) => (
            <CarouselSkipButton
              onClick={() => control.nextSlide()}
              size="3"
              rounded
              variant="translucent"
            >
              <RxArrowRight />
            </CarouselSkipButton>
          )}
          renderBottomCenterControls={(control) => (
            <Flex css={{ listStyleType: "none", mb: "$3" }} as="ul">
              {spotlightItems.map((tx, index) => (
                <Box as="li" key={tx}>
                  <IconButton
                    css={{
                      color:
                        control.currentSlide === index
                          ? "$whiteA12"
                          : "$whiteA9",

                      "&:hover": {
                        color:
                          control.currentSlide === index
                            ? "$whiteA12"
                            : "$whiteA11",
                      },
                    }}
                    onClick={() => control.goToSlide(index)}
                    size="2"
                    variant="transparent"
                  >
                    <RxDotFilled />
                  </IconButton>
                </Box>
              ))}
            </Flex>
          )}
          {...carouselParams}
        >
          {spotlightItems.map((tx) => (
            <Flex
              key={tx}
              css={{
                width: "100%",
                maxHeight: "55dvh",
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
                src={`${appConfig.defaultGateway}/${tx}`}
              />
              <Box
                css={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: "$blackA9",
                  backdropFilter: "blur(8px)",
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
                <Image
                  css={{
                    width: 300,
                    height: 300,
                  }}
                  src={`${appConfig.defaultGateway}/${tx}`}
                />
                <Flex css={{ zIndex: 1 }} direction="column" gap="7">
                  <Box>
                    <Typography
                      size="6"
                      weight="5"
                      css={{ color: "$whiteA12" }}
                    >
                      Dunes
                    </Typography>
                    <Typography
                      size="4"
                      weight="5"
                      css={{ color: "$whiteA11" }}
                    >
                      Winston Arnold
                    </Typography>
                  </Box>
                  <Typography
                    css={{ maxWidth: "60ch", color: "$whiteA11" }}
                    size="2"
                  >
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Commodi maiores quod nulla accusamus qui voluptates atque
                    quasi vero, libero rem!
                  </Typography>
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
          ))}
        </Carousel>
        <Flex direction="column">
          <Typography
            css={{ mb: "$3" }}
            as="h2"
            size="4"
            weight="4"
            contrast="hi"
          >
            latest tracks
          </Typography>
          {recentTracks && recentTracks.length > 0 && (
            <Flex wrap="wrap" gap="10">
              {recentTracks.map((track, idx) => (
                <TrackCard
                  key={track.txid}
                  track={track}
                  trackIndex={idx}
                  tracks={recentTracks}
                />
              ))}
            </Flex>
          )}
          {isLoading && (
            <Flex wrap="wrap" gap="10">
              <TrackSkeleton />
              <TrackSkeleton />
              <TrackSkeleton />
              <TrackSkeleton />
              <TrackSkeleton />
            </Flex>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};
