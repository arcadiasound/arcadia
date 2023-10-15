import { Flex } from "@/ui/Flex";
import {
  ChangeEvent,
  startTransition,
  useEffect,
  useRef,
  useState,
} from "react";
import { Link, useLocation } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { IconButton } from "@/ui/IconButton";
import { FormikErrors, useFormik } from "formik";
import { useQuery } from "@tanstack/react-query";
import { getSearchResults } from "@/lib/getSearchResults";
import { LoadingSpinner } from "@/ui/Loader";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Combobox,
  ComboboxProvider,
  ComboboxPopover,
  ComboboxItem,
} from "@ariakit/react";
import { styled } from "@/stitches.config";
import { Image } from "@/ui/Image";
import { appConfig } from "@/appConfig";
import { BsSoundwave } from "react-icons/bs";

const LinkItem = styled(Link, {
  display: "flex",
});

const StyledComboboxItem = styled(ComboboxItem, {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  cursor: "pointer",
  p: "$3",
  fontSize: "$2",
  lineHeight: "$2",
  color: "$slate11",

  "&:hover": {
    backgroundColor: "$slate4",
    color: "$slate12",
  },
});

const StyledComboboxPopover = styled(ComboboxPopover, {
  backgroundColor: "$slate1",
  boxShadow: "0 0 2px 0 $colors$slate6",
  borderBottomLeftRadius: "$1",
  borderBottomRightRadius: "$1",
  overflow: "hidden",
});

const SearchField = styled(Combobox, {
  appearance: "none",
  // reset
  borderWidth: "0",
  boxSizing: "border-box",
  fontFamily: "inherit",
  margin: "0",
  outline: "none",
  padding: "0",
  width: "100%",
  WebkitTapHighlightColor: "rgba(0,0,0,0)",
  "&::before": {
    boxSizing: "border-box",
  },
  "&::after": {
    boxSizing: "border-box",
  },

  // custom
  backgroundColor: "transparent",
  minWidth: 280,
  br: "$2",
  px: "$4",
  color: "$slate12",
  fontSize: "$3",
  lineHeight: "$sizes$9",

  "@bp4": {
    minWidth: 300,
  },

  "&::placeholder": {
    color: "$slate9",
  },

  "&:focus": {
    boxShadow:
      "inset 0px 0px 0px 1px $colors$blue8, 0px 0px 0px 1px $colors$blue8",
  },

  "&:disabled": {
    pointerEvents: "none",
    cursor: "not-allowed",
    opacity: "50%",
  },

  '&[aria-disabled="true"]': {
    pointerEvents: "none",
    cursor: "not-allowed",
    opacity: "50%",
  },
});

export const SearchBar = () => {
  const [searchValue, setSearchValue] = useState("");
  const location = useLocation();
  const [showResultsDropdown, setShowResultsDropdown] = useState(false);
  const searchFieldRef = useRef<HTMLInputElement | null>(null);

  const handleShowResultsDropdown = () => setShowResultsDropdown(true);
  const handleCancelResultsDropdown = () => setShowResultsDropdown(false);

  const {
    data: searchResults,
    isError,
    refetch,
    isRefetching,
    isLoading,
  } = useQuery({
    queryKey: [`trackResults`, searchValue],
    queryFn: () => {
      if (!searchValue) {
        return;
      }

      return getSearchResults(searchValue);
    },
    refetchOnWindowFocus: false,
    enabled: false,
    onSuccess: () => {
      handleShowResultsDropdown();
    },
  });

  useEffect(() => {
    console.log("mounted");
  }, []);

  useEffect(() => {
    if (searchFieldRef.current) {
      searchFieldRef.current.blur();
    }
    console.log("location changed");
    setShowResultsDropdown(false);
  }, [location]);

  useEffect(() => {
    if (isRefetching) {
      console.log("refetching");
    }
  }, [searchResults, isRefetching]);

  if (location.pathname === "/search") {
    return null;
  }

  const formik = useFormik<{ value: string }>({
    initialValues: {
      value: searchValue || "",
    },
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: () => {},
  });

  const debounceRequest = useDebounce(() => {
    if (searchValue) {
      refetch();
    }
    console.log(searchValue);
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);

    debounceRequest();
  };

  return (
    <Flex
      css={{
        position: "relative",
      }}
      direction="column"
    >
      <Flex
        as="form"
        onSubmit={formik.handleSubmit}
        css={{
          position: "relative",
          br: "$1",
          boxShadow: "0px 0px 0px 1px $colors$slate6",
          "&:focus-within": {
            boxShadow:
              "inset 0px 0px 0px 1px $colors$blue8, 0px 0px 0px 1px $colors$blue8",
          },
        }}
        gap="1"
        align="center"
      >
        <ComboboxProvider
          open={showResultsDropdown}
          setOpen={setShowResultsDropdown}
          setValue={(value) => startTransition(() => setSearchValue(value))}
        >
          <SearchField
            ref={searchFieldRef}
            name="value"
            value={formik.values.value}
            onChange={(e) => {
              formik.handleChange(e);
              handleChange(e);
            }}
            onFocus={() => {
              if (searchValue) {
                console.log(searchResults);
                handleShowResultsDropdown();
              }
            }}
            css={{
              "&[type]": {
                minWidth: 250,
                "&:hover": { boxShadow: "none" },
                "&:focus": { boxShadow: "none" },

                "@bp4": {
                  minWidth: 300,
                },
              },
            }}
            type="text"
            placeholder="Search"
          />

          <StyledComboboxPopover gutter={4} sameWidth portal>
            {searchValue && (
              <StyledComboboxItem
                css={{
                  backgroundColor: "$slate2",
                }}
              >
                Search for "{searchValue}"
              </StyledComboboxItem>
            )}
            {searchResults && searchResults.length > 0 && (
              <>
                {searchResults.map((track) => (
                  <StyledComboboxItem
                    key={track.txid}
                    hideOnClick
                    render={
                      <LinkItem
                        to={{ pathname: "/track", search: `?tx=${track.txid}` }}
                      />
                    }
                  >
                    <Flex gap="2" align="center">
                      <Image
                        css={{
                          width: 20,
                          height: 20,
                        }}
                        src={
                          track.artworkId
                            ? `${appConfig.defaultGateway}/${track.artworkId}`
                            : `https://source.boringavatars.com/marble/20/${track.txid}?square=true`
                        }
                      />
                      {track.title}
                    </Flex>
                    <BsSoundwave />
                  </StyledComboboxItem>
                ))}
              </>
            )}
          </StyledComboboxPopover>
        </ComboboxProvider>
        {isLoading ||
          (isRefetching && (
            <LoadingSpinner
              css={{
                position: "absolute",
                right: "$10",
              }}
            />
          ))}
        <IconButton
          css={{
            position: "absolute",
            right: "$1",
            cursor: "pointer",
          }}
          variant="transparent"
        >
          <FiSearch />
        </IconButton>
      </Flex>
    </Flex>
  );
};
