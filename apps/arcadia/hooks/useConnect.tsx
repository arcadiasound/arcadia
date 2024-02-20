import React, { useEffect, useState } from "react";
import {
  ArweaveConfig,
  ConnectProps,
  PermaProfile,
  Vouched,
  WebWallet,
} from "../types";
import { account } from "../lib/account";
import { PermissionType } from "arconnect";

const ConnectContext = React.createContext<{
  walletAddress?: string;
  addresses?: string[];
  profile?: PermaProfile;
  connecting?: boolean;
  reconnect?: boolean;
  currentProvider?: "arweave.app" | "arconnect";
  vouched?: Vouched;
  config?: ArweaveConfig;
  connect: (props: ConnectProps) => void;
  disconnect: () => void;
  completeConnection: (
    address: string,
    addresses: [],
    config?: ArweaveConfig
  ) => void;
  setState: React.Dispatch<
    React.SetStateAction<{
      connecting?: boolean;
      reconnect?: boolean;
      currentProvider?: "arweave.app" | "arconnect";
      walletAddress?: string | undefined;
      addresses?: string[] | [];
      profile?: PermaProfile | undefined;
      vouched?: Vouched | undefined;
      config?: ArweaveConfig | undefined;
    }>
  >;
}>({
  connecting: false,
  setState: () => {},
  connect: () => {},
  disconnect: () => {},
  completeConnection: () => {},
});

interface ConnectProviderProps {
  webWallet?: typeof WebWallet;
  includeProfile?: boolean;
  shouldReconnect?: string | null;
  detectWalletSwitch?: boolean;
  children: React.ReactNode;
}

const ConnectProvider = ({
  children,
  webWallet,
  includeProfile,
  shouldReconnect,
  detectWalletSwitch,
}: ConnectProviderProps) => {
  const [state, setState] = useState<{
    connecting?: boolean;
    reconnect?: boolean;
    currentProvider?: "arweave.app" | "arconnect";
    walletAddress?: string;
    addresses?: string[];
    profile?: PermaProfile;
    vouched?: Vouched;
    config?: ArweaveConfig;
  }>({
    connecting: false,
  });

  useEffect(() => {
    window.addEventListener("walletSwitch", (e) => handleWalletSwitch(e));
    return window.removeEventListener("walletSwitch", handleWalletSwitch);
  }, []);

  const handleWalletSwitch = (e: CustomEvent<{ address: string }>) => {
    const address = e.detail.address;
    if (detectWalletSwitch) {
      setState((prevValues) => ({ ...prevValues, walletAddress: address }));
    }
  };

  useEffect(() => {
    if (shouldReconnect) {
      setState((prevValues) => ({
        ...prevValues,
        reconnect: true,
        currentProvider: shouldReconnect as "arweave.app" | "arconnect",
        connecting: true,
      }));

      if (shouldReconnect === "arweave.app") {
        handleArweaveAppAutoConnect();
      } else {
        handleArconnectAutoConnect();
      }
    } else {
      setState((prevValues) => ({ ...prevValues, reconnect: false }));
    }
  }, [shouldReconnect]);

  const handleArweaveAppAutoConnect = async () => {
    webWallet?.on("connect", async (params) => {
      let permaProfile: PermaProfile | undefined = undefined;

      if (includeProfile) {
        const acc = account.init({ gateway: undefined });
        permaProfile = await acc.get(params);
      }

      if (permaProfile) {
        setState((prevValues) => ({
          ...prevValues,
          walletAddress: params,
          profile: permaProfile,
          connecting: false,
        }));
      } else {
        setState((prevValues) => ({
          ...prevValues,
          walletAddress: params,
          connecting: false,
        }));
      }
    });
  };

  const handleArconnectAutoConnect = async () => {
    if (shouldReconnect && shouldReconnect === "arconnect") {
      try {
        const address = await window.arweaveWallet.getActiveAddress();

        let permaProfile: PermaProfile | undefined = undefined;

        if (includeProfile) {
          const acc = account.init({ gateway: undefined });
          permaProfile = await acc.get(address);
        }

        if (permaProfile) {
          setState((prevValues) => ({
            ...prevValues,
            walletAddress: address,
            profile: permaProfile,
            connecting: false,
          }));
        } else {
          setState((prevValues) => ({
            ...prevValues,
            walletAddress: address,
            connecting: false,
          }));
        }
      } catch (error) {
        console.error(error);
        setState((prevValues) => ({ ...prevValues, connecting: false }));
      }
    }
  };

  const connect = async (props: ConnectProps) => {
    try {
      if (props.walletProvider === "arweave.app") {
        await connectWithArweaveApp(props.permissions);
      }
      if (props.walletProvider === "arconnect") {
        await connectWithArconnect(props.permissions);
      }
    } catch (e) {
      console.error(e);
      setState((prevValues) => ({ ...prevValues, connecting: false }));
    }
  };

  const connectWithArweaveApp = async (
    requestedPermissions?: PermissionType[]
  ) => {
    if (!webWallet) {
      throw new Error("Must provide an instance of ArweaveWebWallet");
    }

    setState((prevValues) => ({
      ...prevValues,
      currentProvider: "arweave.app",
    }));

    try {
      if (!webWallet.url) {
        webWallet.setUrl("https://arweave.app");
      }

      await webWallet.connect();

      const address = webWallet.address;

      let config: ArweaveConfig | undefined = undefined;

      if (requestedPermissions?.includes("ACCESS_ARWEAVE_CONFIG")) {
        config = (await webWallet.getArweaveConfig()) as ArweaveConfig;
      }

      if (!address) {
        throw new Error(
          "Oops something went wrong when connecting with Arweave.app! Please try again."
        );
      }

      completeConnection(address, [], config);
    } catch (error) {
      throw new Error(error as any);
    }
  };

  const connectWithArconnect = async (
    requestedPermissions?: PermissionType[]
  ) => {
    if (!requestedPermissions) {
      throw new Error("You must at least add one permission");
    }

    setState((preValues) => ({ ...preValues, currentProvider: "arconnect" }));

    let currentPermissions: PermissionType[] = [];

    let address = "";
    let config = {} as ArweaveConfig;
    let addresses: string[] = [];

    currentPermissions = await window.arweaveWallet.getPermissions();

    try {
      if (currentPermissions.length <= 0) {
        await window.arweaveWallet.connect(requestedPermissions);

        address = await window.arweaveWallet.getActiveAddress();

        currentPermissions = await window.arweaveWallet.getPermissions();

        if (currentPermissions.includes("ACCESS_ALL_ADDRESSES")) {
          addresses = await window.arweaveWallet.getAllAddresses();
        }

        if (currentPermissions.includes("ACCESS_ARWEAVE_CONFIG")) {
          config = await window.arweaveWallet.getArweaveConfig();
        }

        await completeConnection(address, addresses, config);
      } else {
        address = await window.arweaveWallet.getActiveAddress();

        if (currentPermissions.includes("ACCESS_ALL_ADDRESSES")) {
          addresses = await window.arweaveWallet.getAllAddresses();
        }

        if (currentPermissions.includes("ACCESS_ARWEAVE_CONFIG")) {
          config = await window.arweaveWallet.getArweaveConfig();
        }

        await completeConnection(address, addresses, config);
      }
    } catch (error) {
      console.error(error);
      await window.arweaveWallet.connect(requestedPermissions);
    }
  };

  const completeConnection = async (
    address: string,
    addresses: string[],
    config?: ArweaveConfig
  ) => {
    const walletConfig = config && `${config?.protocol}://${config?.host}`;
    const stateConfig =
      state.config && `${state.config?.protocol}://${state.config?.host}`;
    const gateway = walletConfig || stateConfig || undefined;
    let permaProfile: PermaProfile | undefined = undefined;

    if (!address) {
      throw new Error("No address found");
    }

    if (includeProfile) {
      const acc = account.init({ gateway });
      permaProfile = await acc.get(address);
    }

    if (permaProfile) {
      setState((prevValues) => ({
        ...prevValues,
        walletAddress: address,
        addresses,
        profile: permaProfile,
        config: config || state.config,
        connecting: false,
      }));
    } else {
      setState((prevValues) => ({
        ...prevValues,
        walletAddress: address,
        addresses,
        config: config || state.config,
        connecting: false,
      }));
    }
  };

  const disconnect = () => {
    window.arweaveWallet.disconnect().then(() => {
      setState((prevValues) => ({
        walletAddress: "",
        reconnect: prevValues.reconnect,
        currentProvider: prevValues.currentProvider,
      }));
    });
  };

  return (
    <ConnectContext.Provider
      value={{
        walletAddress: state.walletAddress,
        addresses: state.addresses,
        profile: state.profile,
        connecting: state.connecting,
        reconnect: state.reconnect,
        currentProvider: state.currentProvider,
        setState: setState,
        vouched: state.vouched,
        config: state.config,
        connect,
        disconnect,
        completeConnection,
      }}
    >
      {children}
    </ConnectContext.Provider>
  );
};

const useConnect = () => React.useContext(ConnectContext);

export { ConnectProvider, useConnect };
