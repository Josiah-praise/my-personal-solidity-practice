"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { RotateCcw, AlertTriangle } from "lucide-react"

export const Refund = () => {
    const [campaignId, setCampaignId] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleRefund = async () => {
        setIsLoading(true)
        // TODO: Implement contract interaction
        console.log("Getting refund from campaign:", campaignId)
        setTimeout(() => setIsLoading(false), 2000)
    }

    return (
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800/30 shadow-xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
                        <RotateCcw className="h-4 w-4 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                        Get Refund
                    </span>
                </CardTitle>
                <CardDescription>
                    Donors can claim refunds if campaign goal was not met after campaign ended
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="refund-campaign-id">Campaign ID</Label>
                    <Input
                        id="refund-campaign-id"
                        placeholder="0x12345678"
                        value={campaignId}
                        onChange={(e) => setCampaignId(e.target.value)}
                    />
                </div>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button 
                            disabled={!campaignId || isLoading}
                            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 border-0"
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            {isLoading ? "Processing..." : "Claim Refund"}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                Confirm Refund Request
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                This will refund your donation from the campaign. This action is only available 
                                if the campaign has ended and the funding goal was not met. 
                                You will receive your full donation amount back.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleRefund}>
                                Confirm Refund
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    )
}