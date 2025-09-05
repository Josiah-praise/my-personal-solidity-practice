import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface requestArgs {
  readonly method: string;
  readonly params?: unknown[] | object;
}

interface EIP1193Provider {
  request: (requestArgs: requestArgs) => Promise<unknown>;
}

type walletState = {
  provider: EIP1193Provider | null;
  accounts: string[];
  chainId: number;
  isLoaded: boolean;
};

type walletActions = {
  updateProvider: (provider: EIP1193Provider) => void;
  updateAccounts: (accounts: string[]) => void;
  updateChainId: (id: number) => void;
  updateIsLoaded: (bool: boolean) => void;
};

export const useWalletStore = create<walletActions & walletState>()(
  immer((set) => ({
    isLoaded: false,
    provider: null,
    accounts: [],
    chainId: 0,

    updateProvider: (provider: EIP1193Provider) =>
      set((state) => {
        state.provider = provider;
      }),

    updateAccounts: (accounts: string[]) =>
      set((state) => {
        state.accounts = accounts;
      }),

    updateChainId: (id: number) =>
      set((state) => {
        state.chainId = id;
      }),

    updateIsLoaded: (bool: boolean) =>
      set((state) => {
        state.isLoaded = true;
      }),
  }))
);
