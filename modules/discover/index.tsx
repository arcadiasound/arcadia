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
import { Box } from "@/ui/Box";
import { IconButton } from "@/ui/IconButton";
import { RxArrowLeft, RxArrowRight, RxDotFilled } from "react-icons/rx";
import { FeaturedTrackItem } from "./components/FeaturedTrackItem";

const CarouselSkipButton = styled(IconButton, {
  mx: "$5",
  // backdropFilter: "blur(20px)",
});

const carouselParams: CarouselProps = {
  wrapAround: true,
  dragThreshold: 0.2,
  // autoplay: true,
  // autoplayInterval: 8000,
  // speed: 1250,
};

const TrackSkeleton = styled(Skeleton, {
  width: 250,
  height: 250,
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
    data: featuredTracks,
    isError: featuredTracksError,
    isLoading: featuredTracksLoading,
  } = useQuery({
    queryKey: [`featuredTracks`],
    refetchOnWindowFocus: false,
    queryFn: () => getFeaturedTracks(),
  });

  const {
    data: recentTracks,
    isError,
    isLoading,
  } = useQuery({
    queryKey: [`recentTracks`],
    enabled: !!featuredTracks?.length,
    refetchOnWindowFocus: false,
    queryFn: () => getRecentTracks(),
  });

  useEffect(() => {
    if (recentTracks && recentTracks.length > 0) {
      play();
    }
  }, [recentTracks]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.scrollY) {
      window.scroll(0, 0);
    }
  }, []);

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
        {featuredTracksLoading && (
          <Skeleton
            css={{
              width: "100%",
              height: "100%",
              maxHeight: "52dvh",
              aspectRatio: 4 / 3,
            }}
          />
        )}
        {featuredTracks && featuredTracks.length && (
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
              <Flex
                css={{
                  listStyleType: "none",
                  // mb: "$3",
                  "& svg": { width: 28, height: 28 },
                }}
                as="ul"
              >
                {featuredTracks.map((track, index) => (
                  <Box as="li" key={track.txid}>
                    <IconButton
                      css={{
                        color:
                          control.currentSlide === index
                            ? "$whiteA12"
                            : "$whiteA7",

                        "&:hover": {
                          color:
                            control.currentSlide === index
                              ? "$whiteA12"
                              : "$whiteA9",
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
            {featuredTracks.map((track, index) => (
              <FeaturedTrackItem
                key={track.txid}
                track={track}
                trackIndex={index}
                tracklist={featuredTracks}
              />
            ))}
          </Carousel>
        )}
        <Flex
          css={{ maxWidth: 1400, alignSelf: "center" }}
          direction="column"
          justify="center"
        >
          <Typography
            css={{ mb: "$3", width: "100%" }}
            as="h2"
            size="4"
            weight="4"
            contrast="hi"
          >
            latest tracks
          </Typography>
          {recentTracks && recentTracks.length > 0 && (
            <Flex css={{ width: "100%", rowGap: "$10" }} wrap="wrap" gap="5">
              {recentTracks.map((track, idx) => (
                <TrackCard
                  key={track.txid}
                  track={track}
                  trackIndex={idx}
                  tracks={recentTracks}
                  size={250}
                />
              ))}
            </Flex>
          )}
          {isLoading && (
            <Flex
              css={{ width: "100%", maxWidth: 1400, rowGap: "$10" }}
              wrap="wrap"
              gap="5"
            >
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
