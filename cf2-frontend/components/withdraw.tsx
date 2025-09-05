"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Banknote, AlertTriangle } from "lucide-react"

export const Withdraw = () => {
    const [campaignId, setCampaignId] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleWithdraw = async () => {
        setIsLoading(true)
        // TODO: Implement contract interaction
        console.log("Withdrawing from campaign:", campaignId)
        setTimeout(() => setIsLoading(false), 2000)
    }

    return (
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800/30 shadow-xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                        <Banknote className="h-4 w-4 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        Withdraw Funds
                    </span>
                </CardTitle>
                <CardDescription>
                    Campaign owners can withdraw funds after goal is met and campaign has ended
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="withdraw-campaign-id">Campaign ID</Label>
                    <Input
                        id="withdraw-campaign-id"
                        placeholder="0x12345678"
                        value={campaignId}
                        onChange={(e) => setCampaignId(e.target.value)}
                    />
                </div>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button 
                            disabled={!campaignId || isLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                            variant="default"
                        >
                            <Banknote className="h-4 w-4 mr-2" />
                            {isLoading ? "Processing..." : "Withdraw Funds"}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                Confirm Withdrawal
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                This action will withdraw all funds from the campaign to your wallet. 
                                Make sure the campaign has ended and the funding goal has been met. 
                                This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleWithdraw}>
                                Confirm Withdrawal
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    )
}