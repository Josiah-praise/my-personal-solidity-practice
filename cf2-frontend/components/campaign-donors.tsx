"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Users, Search, Hash, DollarSign } from "lucide-react"

interface Donor {
    index: number
    amount: string
    exists: boolean
}

export const CampaignDonors = () => {
    const [campaignId, setCampaignId] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [donors, setDonors] = useState<Donor[]>([])

    const handleSearch = async () => {
        setIsLoading(true)
        // TODO: Implement contract interaction
        console.log("Searching donors for campaign:", campaignId)
        
        // Simulate fetching data
        setTimeout(() => {
            setDonors([
                { index: 0, amount: "2.5", exists: true },
                { index: 1, amount: "1.0", exists: true },
                { index: 2, amount: "3.2", exists: true },
                { index: 3, amount: "0.8", exists: true },
            ])
            setIsLoading(false)
        }, 1500)
    }

    const totalDonations = donors.reduce((sum, donor) => sum + parseFloat(donor.amount), 0)

    return (
        <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20 border-teal-200 dark:border-teal-800/30 shadow-xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg">
                        <Users className="h-4 w-4 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                        Campaign Donors
                    </span>
                </CardTitle>
                <CardDescription>
                    View all donors and their contributions to a campaign
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
                        className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                        <Search className="h-4 w-4" />
                        {isLoading ? "Loading..." : "Search"}
                    </Button>
                </div>

                {donors.length > 0 && (
                    <div className="space-y-4 mt-6">
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">
                                Donors ({donors.length})
                            </h3>
                            <Badge variant="outline" className="text-sm">
                                Total: {totalDonations.toFixed(2)} ETH
                            </Badge>
                        </div>

                        <div className="space-y-2">
                            {donors.map((donor, idx) => (
                                <Card key={idx} className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2">
                                                <Hash className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-mono text-sm">#{donor.index}</span>
                                            </div>
                                            <Badge 
                                                variant={donor.exists ? "default" : "secondary"}
                                                className="text-xs"
                                            >
                                                {donor.exists ? "Active" : "Inactive"}
                                            </Badge>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 text-green-500" />
                                            <span className="font-semibold">
                                                {donor.amount} ETH
                                            </span>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {donors.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No donors found for this campaign</p>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}