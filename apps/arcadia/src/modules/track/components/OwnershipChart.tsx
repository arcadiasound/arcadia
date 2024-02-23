import { appConfig } from "@/apps/arcadia/appConfig";
import { ProfileWithOwnership } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/Avatar";
import { Box } from "@/ui/Box";
import { Flex } from "@/ui/Flex";
import { Image } from "@/ui/Image";
import { Typography } from "@/ui/Typography";
import { abbreviateAddress } from "@/utils";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useTheme } from "next-themes";
import { Doughnut } from "react-chartjs-2";

const chartColors = [
  "#F72585",
  "#B5179E",
  "#7209B7",
  "#560BAD",
  "#480CA8",
  "#3A0CA3",
  "#3F37C9",
  "#4361EE",
  "#4895EF",
  "#4CC9F0",
];

interface CustomLegendProps {
  owners: ProfileWithOwnership[];
  colors: string[];
}

const CustomLegend = ({ owners, colors }: CustomLegendProps) => {
  return (
    <Flex as="ol" direction="column" gap="1">
      {owners.map((owner, index) => {
        const colorIndex = index % colors.length;

        return (
          <Flex key={owner.account.addr} gap="1" align="center">
            <Avatar>
              <AvatarImage
                css={{
                  br: "$1",
                  boxSize: "$6",
                  mb: "$1",
                  outlineOffset: 2,
                  outline: `2px solid ${colors[colorIndex]}`,
                }}
                src={
                  owner.account?.profile?.avatarURL ===
                  appConfig.accountAvatarDefault
                    ? `https://source.boringavatars.com/marble/100/${owner.account?.txid}?square=true`
                    : owner.account?.profile.avatarURL
                }
              />
              <AvatarFallback
                css={{
                  br: "$1",
                  boxSize: "$6",
                  outlineOffset: 2,
                  outline: `2px solid ${colors[colorIndex]}`,
                }}
              >
                {owner.account?.profile.name.slice(0, 2) ||
                  owner.account?.addr.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <Typography contrast="hi">
              {owner.account?.profile.name ||
                abbreviateAddress({ address: owner.account.addr })}
            </Typography>
            <Box
              css={{
                height: 1,
                width: "100%",
                flex: 1,
                backgroundColor: "$slate6",
              }}
            />
            <Typography contrast="hi">{owner.ownershipAmount}%</Typography>
          </Flex>
        );
      })}
    </Flex>
  );
};

ChartJS.register(ArcElement, Tooltip, Legend);

interface OwnershipChartProps {
  profilesWithOwnership: ProfileWithOwnership[];
}

export const OwnershipChart = ({
  profilesWithOwnership,
}: OwnershipChartProps) => {
  const { resolvedTheme } = useTheme();
  return (
    <Flex
      css={{ p: "$5", display: "grid", gridTemplateColumns: "2fr 3fr" }}
      justify="between"
      gap="10"
    >
      <CustomLegend owners={profilesWithOwnership} colors={chartColors} />
      <Box
        css={{
          flex: 1,
          width: "100%",
        }}
      >
        <Doughnut
          options={{
            responsive: true,
          }}
          data={{
            labels: [],
            datasets: [
              {
                label: "% ownership",
                data: profilesWithOwnership.map(
                  (profile) => profile.ownershipAmount
                ),
                backgroundColor: chartColors,
                borderWidth: 2,
                borderRadius: 4,
                borderColor:
                  resolvedTheme === "dark"
                    ? "hsl(200, 6.0%, 6.0%)"
                    : "hsl(206, 30.0%, 98.8%)",
              },
            ],
          }}
        />
      </Box>
    </Flex>
  );
};
