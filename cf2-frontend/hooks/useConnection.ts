import { useWalletStore } from "@/store/wallet-store";
import { ethers } from "ethers";
import { useState } from "react";
import { toast } from "sonner";

interface EIP1193Provider {
  request: (requestArgs: requestArgs) => Promise<unknown>;
}

interface ProviderRpcError extends Error {
  code: number;
  data?: unknown;
}

interface requestArgs {
  readonly method: string;
  readonly params?: unknown[] | object;
}

export const useConnection = () => {
  const { updateAccounts, updateChainId, updateProvider, updateIsLoaded } = useWalletStore();


  const handleConnection = async (provider: ethers.Eip1193Provider) => {
    try {
      // make connection request
      const accounts = await provider.request({
        method: "eth_requestAccounts",
      });
      updateAccounts(accounts as Array<string>);
      // get chainId
      const $chainId = await provider.request({ method: "eth_chainId" });

      // switch to the right chain
      if ($chainId != "0xaa36a7") {
        try {
          await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xaa36a7" }],
          });
          toast.info("Switched to ethereum sepolia");
        } catch (err) {
          alert("Shit went wrong")
          console.error(err);
          toast.error("Chain not found. Add manually");
        }
      }

      updateChainId(11155111 as number);
      updateProvider(provider);
      updateIsLoaded(true);
      toast.success(`Connection successful`);
    } catch (error: any) {
      console.error(error);
      toast.error(`Error connecting ${error.code && `CODE: ${error.code}`}`);
    }
  };

  return {
    handleConnection,
  };
};
