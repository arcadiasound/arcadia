import { Flex } from "@/ui/Flex";
import { Typography } from "@/ui/Typography";
import { getRecentTracks } from "@/lib/getRecentTracks";
import { useQuery } from "@tanstack/react-query";
import { TrackCard } from "../track/TrackCard";
import { styled } from "@/apps/arcadia/stitches.config";
import { Skeleton } from "@/ui/Skeleton";
import { useMotionAnimate } from "motion-hooks";
import { stagger } from "motion";
import { useEffect } from "react";
import { getFeaturedTracks } from "@/lib/getFeaturedTracks";
import { Box } from "@/ui/Box";
import { IconButton } from "@/ui/IconButton";
import {
  RxArrowLeft,
  RxArrowRight,
  RxChevronLeft,
  RxChevronRight,
  RxDotFilled,
} from "react-icons/rx";
import { FeaturedTrackItem } from "./components/FeaturedTrackItem";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Splide, SplideSlide, SplideTrack } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";

const TRACK_CARD_SIZE = 220;

const StyledSplide = styled(Splide);

const CarouselSkipButton = styled(IconButton, {
  mx: "$5",
  mt: "$5",
});

const TrackSkeleton = styled(Skeleton, {
  width: TRACK_CARD_SIZE,
  height: TRACK_CARD_SIZE,
});

export const Discover = () => {
  const isTablet = useMediaQuery("(min-width: 768px)");
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
        // pt: 64,
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
              maxHeight: "58dvh",
              aspectRatio: 4 / 3,
            }}
          />
        )}
        {featuredTracks && featuredTracks.length && (
          <StyledSplide
            hasTrack={false}
            tag="section"
            aria-label="Featured tracks"
            options={{
              speed: 950,
              type: "loop",
              arrows: isTablet ? true : false,
            }}
          >
            <SplideTrack>
              {featuredTracks.map((track, index) => (
                <SplideSlide key={track.txid}>
                  <FeaturedTrackItem
                    track={track}
                    trackIndex={index}
                    tracklist={featuredTracks}
                  />
                </SplideSlide>
              ))}
            </SplideTrack>

            <Box
              css={{
                ".splide__arrow": {
                  backgroundColor: "$whiteA12",
                  color: "$blackA11",
                },
              }}
              className="splide__arrows"
            >
              <CarouselSkipButton
                className="splide__arrow splide__arrow--next"
                rounded
              >
                <RxArrowRight />
              </CarouselSkipButton>
              <CarouselSkipButton
                className="splide__arrow splide__arrow--prev"
                rounded
              >
                <RxArrowRight />
              </CarouselSkipButton>
            </Box>
          </StyledSplide>
        )}
        <Flex
          css={{ maxWidth: 1400, alignSelf: "center" }}
          direction="column"
          justify="center"
        >
          <Typography
            css={{ width: "100%" }}
            as="h2"
            size="4"
            weight="4"
            contrast="hi"
          >
            fresh sounds
          </Typography>
          {recentTracks && recentTracks.length && (
            <StyledSplide
              hasTrack={false}
              onArrowsUpdated={(Styled, prev, next) => {
                console.log(prev, next);
              }}
              options={{
                speed: 950,
                pagination: false,
                gap: 20,
                loop: isTablet ? true : false,
                drag: isTablet ? true : false,
                breakpoints: {
                  3840: {
                    perPage: 5,
                    width: "80dvw",
                  },
                  1536: {
                    perPage: 5,
                    width: "80dvw",
                  },
                  1280: {
                    perPage: 5,
                    width: 1080,
                  },
                  1024: {
                    perPage: 3,
                    width: "90dvw",
                    arrows: false,
                  },
                  768: {
                    perPage: 3,
                    width: "90dvw",
                  },
                  520: {
                    perPage: 2,
                    width: "90dvw",
                  },
                },
              }}
              css={{
                pt: "$5",
              }}
            >
              <SplideTrack>
                {/* <Flex
                  css={{ width: "100%", rowGap: "$10" }}
                  wrap="wrap"
                  gap="7"
                > */}
                {recentTracks.map((track, idx) => (
                  <SplideSlide>
                    <TrackCard
                      key={track.txid}
                      track={track}
                      trackIndex={idx}
                      tracks={recentTracks}
                      size={TRACK_CARD_SIZE}
                    />
                  </SplideSlide>
                ))}
                {/* </Flex> */}
              </SplideTrack>

              <Flex
                css={{
                  gap: "$5",
                  position: "absolute",
                  top: "-$3",
                  right: 0,

                  ".splide__arrow": {
                    top: 0,
                    right: 0,
                    position: "relative",
                    backgroundColor: "transparent",
                  },
                }}
                className="splide__arrows"
              >
                <IconButton
                  className="splide__arrow splide__arrow--prev"
                  variant="transparent"
                >
                  <RxChevronRight />
                </IconButton>
                <IconButton
                  className="splide__arrow splide__arrow--next"
                  variant="transparent"
                >
                  <RxChevronRight />
                </IconButton>
              </Flex>
            </StyledSplide>
          )}
          {isLoading && (
            <Flex
              css={{ width: "100%", maxWidth: 1400, rowGap: "$10" }}
              wrap="wrap"
              gap="7"
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
