import { useEffect, useState } from "react";

interface requestArgs {
  readonly method: string;
  readonly params?: unknown[] | object;
}

interface EIP1193Provider {
  request: (requestArgs: requestArgs) => Promise<unknown>;
}

interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: EIP1193Provider;
}

interface EIP6963AnnounceProviderEvent extends CustomEvent {
  type: "eip6963:announceProvider";
  detail: EIP6963ProviderDetail;
}

interface EIP6963RequestProviderEvent extends Event {
  type: "eip6963:requestProvider";
}

type wallets = EIP6963ProviderDetail[];

export const useWalletDiscovery = () => {
    const [isLoading, setLoading] = useState<boolean>(true);
    const [wallets, setWallets] = useState<wallets>([]);

    useEffect(() => {
        const announceProviderHandler = (event: EIP6963AnnounceProviderEvent) => {
            setWallets((prevWallets) => [...prevWallets, event.detail]);
        };
        window.addEventListener(
            "eip6963:announceProvider",
            announceProviderHandler
        );

        window.dispatchEvent(new Event("eip6963:requestProvider"));
        setLoading(false);
        return () =>
            window.removeEventListener(
                "eip6963:announceProvider",
                announceProviderHandler
            );
    }, []);

    return {wallets, isLoading};
};
