import React, { useState } from "react";
import Pie, { ProvidedProps, PieArcDatum } from "@visx/shape/lib/shapes/Pie";
import { scaleOrdinal } from "@visx/scale";
import { Group } from "@visx/group";
import { animated, useTransition, interpolate } from "@react-spring/web";
import ParentSize from "@visx/responsive/lib/components/ParentSize";
import { TrackAssetOwner } from "@/types";
import { Box, Heading } from "@radix-ui/themes";
import { css } from "@/styles/css";
import { abbreviateAddress } from "@/utils";
import { useQueries } from "@tanstack/react-query";
import { getProfile } from "@/lib/profile/getProfile";

// accessor functions
const ownershipAmount = (d: TrackAssetOwner) => d.ownershipAmount;

const defaultMargin = { top: 20, right: 20, bottom: 20, left: 20 };

export type PieProps = {
  width: number;
  height: number;
  margin?: typeof defaultMargin;
  animate?: boolean;
  owners: TrackAssetOwner[];
};

const PieChart = ({
  width,
  height,
  margin = defaultMargin,
  animate = true,
  owners, // Add trackOwners to the component props
}: PieProps) => {
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  const ownerNames = Object.keys(owners).map((address) => abbreviateAddress({ address }));

  // color scales
  const getOwnerColor = scaleOrdinal({
    domain: ownerNames,
    range: [
      "var(--accent-9)",
      "var(--accent-7)",
      "var(--accent-6)",
      "var(--accent-5)",
      "var(--accent-4)",
      "var(--accent-3)",
    ],
  });

  if (width < 10) return null;

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const radius = Math.min(innerWidth, innerHeight) / 2;
  const centerY = innerHeight / 2;
  const centerX = innerWidth / 2;
  const donutThickness = 64;

  // Update the color scale domain with track owners' addresses
  getOwnerColor.domain(owners.map((owner) => owner.address));

  return (
    <svg width={width} height={height}>
      <Group top={centerY + margin.top} left={centerX + margin.left}>
        <Pie
          data={
            selectedAddress ? owners.filter(({ address }) => address === selectedAddress) : owners
          }
          pieValue={(data: TrackAssetOwner) => data.ownershipAmount}
          outerRadius={radius}
          innerRadius={radius - donutThickness}
          cornerRadius={3}
          padAngle={0.005}
        >
          {(pie) => (
            <AnimatedPie<TrackAssetOwner>
              {...pie}
              animate={animate}
              getKey={(arc) => abbreviateAddress({ address: arc.data.address })}
              onClickDatum={({ data: { address } }) => {
                animate &&
                  setSelectedAddress(
                    selectedAddress && selectedAddress === address ? null : address
                  );
                // Assuming you have a mapping from address to images
                setCurrentImage(
                  `https://source.boringavatars.com/marble/100/${encodeURIComponent(address)}`
                );
              }}
              getColor={(arc) => getOwnerColor(arc.data.address)}
            />
          )}
        </Pie>
        {/* Render the image inside the pie chart if there's a selected address */}
        {/* {selectedAddress && currentImage && (
          <image
            href={currentImage}
            x={centerX / donutThickness}
            y={centerY / donutThickness}
            height={donutThickness * 2}
            width={donutThickness * 2}
            preserveAspectRatio="xMidYMid slice"
          />
        )} */}
      </Group>
      {animate && (
        <text
          textAnchor="end"
          x={width - 16}
          y={height - 16}
          fill="white"
          fontSize={11}
          fontWeight={300}
          pointerEvents="none"
        >
          Click segments to update
        </text>
      )}
    </svg>
  );
};

// react-spring transition definitions
type AnimatedStyles = { startAngle: number; endAngle: number; opacity: number };

const fromLeaveTransition = ({ endAngle }: PieArcDatum<any>) => ({
  // enter from 360° if end angle is > 180°
  startAngle: endAngle > Math.PI ? 2 * Math.PI : 0,
  endAngle: endAngle > Math.PI ? 2 * Math.PI : 0,
  opacity: 0,
});
const enterUpdateTransition = ({ startAngle, endAngle }: PieArcDatum<any>) => ({
  startAngle,
  endAngle,
  opacity: 1,
});

type AnimatedPieProps<Datum> = ProvidedProps<Datum> & {
  animate?: boolean;
  getKey: (d: PieArcDatum<Datum>) => string;
  getColor: (d: PieArcDatum<Datum>) => string;
  onClickDatum: (d: PieArcDatum<Datum>) => void;
  delay?: number;
};

function AnimatedPie<Datum>({
  animate,
  arcs,
  path,
  getKey,
  getColor,
  onClickDatum,
}: AnimatedPieProps<Datum>) {
  const transitions = useTransition<PieArcDatum<Datum>, AnimatedStyles>(arcs, {
    from: animate ? fromLeaveTransition : enterUpdateTransition,
    enter: enterUpdateTransition,
    update: enterUpdateTransition,
    leave: animate ? fromLeaveTransition : enterUpdateTransition,
    keys: getKey,
  });
  return transitions((props, arc, { key }) => {
    const [centroidX, centroidY] = path.centroid(arc);
    const hasSpaceForLabel = arc.endAngle - arc.startAngle >= 0.3;

    return (
      <g key={key}>
        <animated.path
          // compute interpolated path d attribute from intermediate angle values
          d={interpolate([props.startAngle, props.endAngle], (startAngle, endAngle) =>
            path({
              ...arc,
              startAngle,
              endAngle,
            })
          )}
          fill={getColor(arc)}
          onClick={() => onClickDatum(arc)}
          onTouchStart={() => onClickDatum(arc)}
        />
        {hasSpaceForLabel && (
          <animated.g style={{ opacity: props.opacity }}>
            <text
              fill={
                getColor(arc) === "var(--accent-9)"
                  ? "var(--accent-9-contrast)"
                  : "var(--accent-12)"
              }
              x={centroidX}
              y={centroidY}
              dy=".33em"
              fontSize={11}
              textAnchor="middle"
              pointerEvents="none"
            >
              {getKey(arc)}
            </text>
          </animated.g>
        )}
      </g>
    );
  });
}

interface OwnersChartProps {
  owners: TrackAssetOwner[];
}

export const OwnersChart = (props: OwnersChartProps) => {
  const results = useQueries({
    queries: props.owners.map((owner, idx) => {
      return {
        queryKey: ["profile", owner.address],
        queryFn: () => getProfile({ address: owner.address }),
      };
    }),
  });

  const allProfilesLoaded = results.every((query) => query.isSuccess);

  // Create a new array of owners with updated names if available
  const updatedOwners = allProfilesLoaded
    ? props.owners.map((owner, idx) => {
        const profile = results[idx].data?.profiles[0];
        return {
          ...owner,
          address: profile?.name || owner.address, // Use profile name if available
        };
      })
    : props.owners;

  return (
    <Box
      mt="3"
      p="5"
      style={css({
        borderRadius: "max(var(--radius-3), var(--radius-4))",
        backgroundColor: "var(--side-panel-background)",
        position: "relative",
        width: "100%",
        aspectRatio: 1 / 1,
        maxHeight: 500,
      })}
    >
      <Heading as="h3" size="4" weight="medium">
        Owners
      </Heading>
      {/* <Box
    style={css({
      display: "grid",
      placeItems: "center",
      width: 275,
      height: 275,
      position: "absolute",
      inset: 0,
      margin: "auto",
      backgroundColor: "var(--gray-3)",
      borderRadius: 9999,
      zIndex: -1,
    })}
  >
    Image goes gere
  </Box> */}
      <ParentSize>
        {({ width, height }) => <PieChart width={width} height={height} owners={updatedOwners} />}
      </ParentSize>
    </Box>
  );
};
