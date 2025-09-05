"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getContract } from "@/lib/helpers";
import { CF2_CONFIG } from "@/lib/config";
import abi from "../lib/abi.json";
import { useWalletStore } from "@/store/wallet-store";
import { ethers } from "ethers";
import { Calendar, DollarSign, Plus } from "lucide-react";
import { toast } from "sonner";

export const CreateCampaign = () => {
  const [fundingGoal, setFundingGoal] = useState<number>(0);
  const [durationInDays, setDurationInDays] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const {provider: eip1193Provider, accounts} = useWalletStore();

  const handleCreateCampaign = async () => {
    setIsLoading(true);
    // TODO: Implement contract interaction
    const browserProvider = new ethers.BrowserProvider(
      eip1193Provider as ethers.Eip1193Provider
    );
    const signer = await browserProvider.getSigner();
    const cf2Contract = new ethers.Contract(
      CF2_CONFIG.CF2_ADDRESS as string,
      abi,
      signer
    );
    const filter = cf2Contract.filters.CampaignCreated(accounts[0], null);

    cf2Contract.once(filter, (event) => {
      console.log("Contract event emitted:", event);
      toast.success("Created successfully")
    });

    const tx = await cf2Contract.createCampaign(
      BigInt(fundingGoal),
      durationInDays
    );
    const txRecipt = await tx.wait();
    // console.log("Transaction: ", tx);
    // console.log("Transaction Recipt: ", txRecipt);

    setIsLoading(false);
  };

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800/30 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
            <Plus className="h-4 w-4 text-white" />
          </div>
          <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Create New Campaign
          </span>
        </CardTitle>
        <CardDescription>
          Launch a new crowdfunding campaign on the CF2 platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="funding-goal" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Funding Goal (ETH)
            </Label>
            <Input
              id="funding-goal"
              type="number"
              placeholder="0.0"
              step="0.01"
              value={fundingGoal}
              onChange={(e) => setFundingGoal(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Duration (Days)
            </Label>
            <Input
              id="duration"
              type="number"
              placeholder="30"
              min="1"
              value={durationInDays}
              onChange={(e) => setDurationInDays(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Campaign Description</Label>
          <Textarea
            id="description"
            placeholder="Describe your campaign goals and how the funds will be used..."
            className="min-h-[100px]"
          />
        </div>

        <Button
          onClick={handleCreateCampaign}
          disabled={!fundingGoal || !durationInDays || isLoading}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {isLoading ? "Creating Campaign..." : "Create Campaign"}
        </Button>
      </CardContent>
    </Card>
  );
};
