"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Search, User, Target, Clock, Calendar, TrendingUp } from "lucide-react"

interface CampaignData {
    owner: string
    fundingGoal: string
    durationInDays: string
    createdAt: string
    state: "MET" | "NOT_MET"
    purse?: string
}

export const CampaignDetails = () => {
    const [campaignId, setCampaignId] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [campaignData, setCampaignData] = useState<CampaignData | null>(null)

    const handleSearch = async () => {
        setIsLoading(true)
        // TODO: Implement contract interaction
        console.log("Searching campaign:", campaignId)
        
        // Simulate fetching data
        setTimeout(() => {
            setCampaignData({
                owner: "0x1234567890123456789012345678901234567890",
                fundingGoal: "10.0",
                durationInDays: "30",
                createdAt: Date.now().toString(),
                state: "NOT_MET",
                purse: "7.5"
            })
            setIsLoading(false)
        }, 1500)
    }

    const formatDate = (timestamp: string) => {
        return new Date(parseInt(timestamp) * 1000).toLocaleDateString()
    }

    const getStateColor = (state: string) => {
        return state === "MET" ? "bg-green-500" : "bg-yellow-500"
    }

    return (
        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200 dark:border-purple-800/30 shadow-xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 shadow-lg">
                        <Search className="h-4 w-4 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                        Campaign Details
                    </span>
                </CardTitle>
                <CardDescription>
                    Look up detailed information about any campaign
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Input
                        placeholder="Enter Campaign ID (0x12345678)"
                        value={campaignId}
                        onChange={(e) => setCampaignId(e.target.value)}
                        className="flex-1"
                    />
                    <Button 
                        onClick={handleSearch}
                        disabled={!campaignId || isLoading}
                        className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                        <Search className="h-4 w-4" />
                        {isLoading ? "Loading..." : "Search"}
                    </Button>
                </div>

                {campaignData && (
                    <div className="space-y-4 mt-6">
                        <Separator />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <Label className="text-sm font-medium">Owner</Label>
                                </div>
                                <code className="text-xs bg-muted p-2 rounded block">
                                    {campaignData.owner}
                                </code>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                    <Label className="text-sm font-medium">Status</Label>
                                </div>
                                <Badge className={getStateColor(campaignData.state)}>
                                    {campaignData.state === "MET" ? "Goal Met" : "Goal Not Met"}
                                </Badge>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Target className="h-4 w-4 text-muted-foreground" />
                                    <Label className="text-sm font-medium">Funding Goal</Label>
                                </div>
                                <p className="text-lg font-semibold">{campaignData.fundingGoal} ETH</p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <Label className="text-sm font-medium">Duration</Label>
                                </div>
                                <p className="text-lg font-semibold">{campaignData.durationInDays} days</p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <Label className="text-sm font-medium">Created At</Label>
                                </div>
                                <p className="text-sm">{formatDate(campaignData.createdAt)}</p>
                            </div>

                            {campaignData.purse && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                        <Label className="text-sm font-medium">Current Funds</Label>
                                    </div>
                                    <p className="text-lg font-semibold text-green-600">
                                        {campaignData.purse} ETH
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}