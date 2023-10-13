interface AbbreviateAddressOptions {
  startChars?: number;
  endChars?: number;
  noOfEllipsis?: number;
}

interface AbbreviateAddress {
  address: string | undefined;
  options?: AbbreviateAddressOptions;
}

export const abbreviateAddress = ({
  address,
  options = {},
}: AbbreviateAddress) => {
  const { startChars = 5, endChars = 4, noOfEllipsis = 2 } = options;

  const dot = ".";
  const firstFive = address?.substring(0, startChars);
  const lastFour = address?.substring(address.length - endChars);
  return `${firstFive}${dot.repeat(noOfEllipsis)}${lastFour}`;
};

export const formatTime = (time: number): string => {
  const minutes: number = Math.floor(time / 60) % 60;
  const seconds: number = Math.floor(time % 60);
  const hours: number = Math.floor(time / 3600);

  const formattedSeconds: string = `${seconds < 10 ? "0" : ""}${seconds}`;

  if (hours > 0) {
    return `${hours}:${minutes}:${formattedSeconds}`;
  }

  return `${minutes}:${formattedSeconds}`;
};
