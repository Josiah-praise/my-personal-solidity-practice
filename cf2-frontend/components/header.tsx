"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, Heart, Circle } from "lucide-react";
import { ConnectWalletButton } from "./connectWalletButton";
import { useWalletStore } from "@/store/wallet-store";

export const Header = () => {
  // const connectWallet = () => {

  // }
  const accounts = useWalletStore((state)=> state.accounts)
  return (
    <header className="border-b bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
      <nav className="w-full max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg animate-pulse-glow">
              <Heart className="h-6 w-6 text-white animate-float" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent animate-gradient-shift">
                CF2 CrowdFund
              </h1>
              <p className="text-sm text-muted-foreground">
                Decentralized Crowdfunding Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!!accounts.length && <Circle size={10} className="text-green-100" fill="true"/>  }
            <Badge
              variant="outline"
              className="text-xs border-purple-200 text-purple-700 dark:border-purple-700 dark:text-purple-300"
            >
             { accounts.length > 0 ? `${accounts[0].slice(0, 6)}...${accounts[0].slice(17,20)}` : "0x00"}
            </Badge>

            <ConnectWalletButton>
              <Button
                size="sm"
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Wallet className="h-4 w-4" />
                {accounts.length ? `Connected` : 'Connect Wallet'}
              </Button>
            </ConnectWalletButton>
          </div>
        </div>
      </nav>
    </header>
  );
};
