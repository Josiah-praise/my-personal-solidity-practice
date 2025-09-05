"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConnection } from "@/hooks/useConnection";
import { useWalletDiscovery } from "@/hooks/useWalletDiscovery";
import { useWalletStore } from "@/store/wallet-store";
import { Loader } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export function ConnectWalletButton({
  children,
}: {
  children: React.ReactNode;
}) {
  const { wallets, isLoading } = useWalletDiscovery();
  const { handleConnection } = useConnection();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const {
    provider: eip1193Provider,
    updateAccounts,
    isLoaded,
    accounts,
  } = useWalletStore();

  useEffect(() => {
    if (!isLoaded || !accounts.length) return;
    // setup listener for accountsChange event on mount
    const handleAccountsChange = (accounts: string[]) => {
      updateAccounts(accounts);
      console.log(`Accounts was fucking changed`);
    };
    eip1193Provider.on("accountsChanged", handleAccountsChange);

    return () =>
      eip1193Provider.removeListener("accountsChanged", handleAccountsChange);
  }, [isLoaded, eip1193Provider, updateAccounts, accounts]);

  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select a wallet to connect to</DialogTitle>
        </DialogHeader>
        <div>
          {isLoading ? (
            <Loader className="animate-spin" />
          ) : (
            <ul>
              {wallets.map(({ info: { icon, name, uuid }, provider }) => (
                <li
                  key={uuid}
                  onClick={() => {
                    handleConnection(provider);

                    setOpenModal(!openModal);
                  }}
                  className="hover:cursor-pointer hover:bg-gray-100 transition-colors py-1.5 px-3 bg-gray-200 rounded-sm flex justify-between items-center"
                >
                  <img src={icon} alt="icon" />
                  <span className="font-bold">{name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
