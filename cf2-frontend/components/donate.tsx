"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Heart, Send } from "lucide-react"

export const Donate = () => {
    const [campaignId, setCampaignId] = useState("")
    const [donationAmount, setDonationAmount] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleDonate = async () => {
        setIsLoading(true)
        // TODO: Implement contract interaction
        console.log("Donating:", { campaignId, donationAmount })
        setTimeout(() => setIsLoading(false), 2000)
    }

    return (
        <Card className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 border-pink-200 dark:border-pink-800/30 shadow-xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg">
                        <Heart className="h-4 w-4 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                        Donate to Campaign
                    </span>
                </CardTitle>
                <CardDescription>
                    Support a campaign by making a donation
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="campaign-id">Campaign ID</Label>
                    <Input
                        id="campaign-id"
                        placeholder="0x12345678"
                        value={campaignId}
                        onChange={(e) => setCampaignId(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="donation-amount">Donation Amount (ETH)</Label>
                    <Input
                        id="donation-amount"
                        type="number"
                        placeholder="0.0"
                        step="0.01"
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(e.target.value)}
                    />
                </div>

                <Button 
                    onClick={handleDonate}
                    disabled={!campaignId || !donationAmount || isLoading}
                    className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                    <Send className="h-4 w-4 mr-2" />
                    {isLoading ? "Sending Donation..." : "Donate Now"}
                </Button>
            </CardContent>
        </Card>
    )
}