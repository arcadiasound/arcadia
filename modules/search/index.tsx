import { Button } from "@/ui/Button";
import { Flex } from "@/ui/Flex";
import { TextField } from "@/ui/TextField";
import { Link, useLocation } from "react-router-dom";
import { useFormik } from "formik";
import { useQuery } from "@tanstack/react-query";
import { getSearchResults } from "@/lib/getSearchResults";
import { Typography } from "@/ui/Typography";
import { Image } from "@/ui/Image";
import { appConfig } from "@/appConfig";
import { BsSoundwave } from "react-icons/bs";
import { useEffect } from "react";

export const Search = () => {
  const location = useLocation();
  const query = location.search;
  const urlParams = new URLSearchParams(query);
  const queryValue = urlParams.get("q");

  const formik = useFormik<{ value: string }>({
    initialValues: {
      value: queryValue || "",
    },
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: () => {
      refetch();
    },
  });

  useEffect(() => {
    if (queryValue) {
      refetch();
    }
  }, []);

  const {
    data: searchResults,
    isError,
    refetch,
    isRefetching,
    isLoading,
  } = useQuery({
    queryKey: [`trackSearchResults`],
    queryFn: () => {
      if (!formik.values.value) {
        return;
      }

      return getSearchResults(formik.values.value);
    },
    refetchOnWindowFocus: false,
    enabled: false,
  });

  return (
    <Flex direction="column" gap="10">
      <Flex onSubmit={formik.handleSubmit} as="form" align="center" gap="2">
        <TextField
          type="text"
          name="value"
          placeholder="Search"
          value={formik.values.value}
          onChange={formik.handleChange}
          css={{
            maxWidth: 800,

            "&[type]": {
              lineHeight: "$8",
              backgroundColor: "transparent",
              boxShadow: "0 0 0 1px $colors$slate6",
            },
          }}
        />
        <Button
          css={{
            br: "$1",
          }}
          variant="solid"
        >
          Search
        </Button>
      </Flex>
      {searchResults && searchResults.length > 0 ? (
        <Flex
          css={{
            maxWidth: 900,
          }}
          direction="column"
          gap="3"
        >
          {searchResults.map((track) => (
            <Link to={{ pathname: "/track", search: `?tx=${track.txid}` }}>
              <Flex
                css={{ p: "$3", "&:hover": { backgroundColor: "$slate2" } }}
                justify="between"
                align="center"
              >
                <Flex key={track.txid} align="center" gap="5">
                  <Image
                    css={{
                      width: 48,
                      height: 48,
                    }}
                    src={
                      track.artworkId
                        ? `${appConfig.defaultGateway}/${track.artworkId}`
                        : `https://source.boringavatars.com/marble/20/${track.txid}?square=true`
                    }
                  />
                  <Typography>{track.title}</Typography>
                </Flex>
                <BsSoundwave />
              </Flex>
            </Link>
          ))}
        </Flex>
      ) : (
        <Typography>No results found. Please refine your search.</Typography>
      )}
    </Flex>
  );
};
