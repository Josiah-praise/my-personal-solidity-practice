"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Activity, Plus, Heart, Banknote, RotateCcw, Clock, Hash, User } from "lucide-react"

interface ContractEvent {
    id: string
    type: "CampaignCreated" | "Donation" | "Withdrawal" | "Refund"
    blockNumber: number
    transactionHash: string
    timestamp: number
    data: {
        owner?: string
        donor?: string
        campaignID?: string
        amount?: string
    }
}

export const EventsFeed = () => {
    const [events, setEvents] = useState<ContractEvent[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const fetchEvents = async () => {
        setIsLoading(true)
        // TODO: Implement contract event listening
        console.log("Fetching contract events...")
        
        // Simulate fetching events
        setTimeout(() => {
            const mockEvents: ContractEvent[] = [
                {
                    id: "1",
                    type: "CampaignCreated",
                    blockNumber: 18500000,
                    transactionHash: "0xabcdef1234567890...",
                    timestamp: Date.now() - 3600000,
                    data: {
                        owner: "0x1234...5678",
                        campaignID: "0x12345678"
                    }
                },
                {
                    id: "2",
                    type: "Donation",
                    blockNumber: 18500001,
                    transactionHash: "0x1234567890abcdef...",
                    timestamp: Date.now() - 1800000,
                    data: {
                        donor: "0xabcd...efgh",
                        campaignID: "0x12345678",
                        amount: "2.5"
                    }
                },
                {
                    id: "3",
                    type: "Donation",
                    blockNumber: 18500002,
                    transactionHash: "0x567890abcdef1234...",
                    timestamp: Date.now() - 900000,
                    data: {
                        donor: "0xijkl...mnop",
                        campaignID: "0x12345678",
                        amount: "1.0"
                    }
                },
                {
                    id: "4",
                    type: "Withdrawal",
                    blockNumber: 18500003,
                    transactionHash: "0x890abcdef1234567...",
                    timestamp: Date.now() - 300000,
                    data: {
                        owner: "0x1234...5678",
                        campaignID: "0x87654321",
                        amount: "5.0"
                    }
                }
            ]
            setEvents(mockEvents)
            setIsLoading(false)
        }, 1500)
    }

    useEffect(() => {
        fetchEvents()
    }, [])

    const getEventIcon = (type: string) => {
        switch (type) {
            case "CampaignCreated":
                return <Plus className="h-4 w-4 text-blue-500" />
            case "Donation":
                return <Heart className="h-4 w-4 text-red-500" />
            case "Withdrawal":
                return <Banknote className="h-4 w-4 text-green-500" />
            case "Refund":
                return <RotateCcw className="h-4 w-4 text-yellow-500" />
            default:
                return <Activity className="h-4 w-4" />
        }
    }

    const getEventColor = (type: string) => {
        switch (type) {
            case "CampaignCreated":
                return "bg-blue-500"
            case "Donation":
                return "bg-red-500"
            case "Withdrawal":
                return "bg-green-500"
            case "Refund":
                return "bg-yellow-500"
            default:
                return "bg-gray-500"
        }
    }

    const formatTime = (timestamp: number) => {
        const now = Date.now()
        const diff = now - timestamp
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        
        if (hours > 0) {
            return `${hours}h ago`
        }
        return `${minutes}m ago`
    }

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`
    }

    return (
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200 dark:border-indigo-800/30 shadow-xl">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <div className="p-2 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
                                <Activity className="h-4 w-4 text-white" />
                            </div>
                            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                Live Events Feed
                            </span>
                        </CardTitle>
                        <CardDescription>
                            Real-time contract events and activities
                        </CardDescription>
                    </div>
                    <Button 
                        onClick={fetchEvents} 
                        disabled={isLoading} 
                        size="sm"
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                        {isLoading ? "Loading..." : "Refresh"}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {events.length > 0 ? (
                    <div className="space-y-4">
                        {events.map((event, idx) => (
                            <div key={event.id}>
                                <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                        {getEventIcon(event.type)}
                                    </div>
                                    
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Badge className={getEventColor(event.type)}>
                                                {event.type}
                                            </Badge>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                {formatTime(event.timestamp)}
                                            </div>
                                        </div>
                                        
                                        <div className="text-sm space-y-1">
                                            {event.type === "CampaignCreated" && (
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-3 w-3" />
                                                        Owner: <code className="text-xs">{formatAddress(event.data.owner!)}</code>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Hash className="h-3 w-3" />
                                                        Campaign: <code className="text-xs">{event.data.campaignID}</code>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {event.type === "Donation" && (
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-3 w-3" />
                                                        Donor: <code className="text-xs">{formatAddress(event.data.donor!)}</code>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Hash className="h-3 w-3" />
                                                        Campaign: <code className="text-xs">{event.data.campaignID}</code>
                                                    </div>
                                                    <div className="font-semibold text-green-600">
                                                        Amount: {event.data.amount} ETH
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {(event.type === "Withdrawal" || event.type === "Refund") && (
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-3 w-3" />
                                                        {event.type === "Withdrawal" ? "Owner" : "Donor"}: 
                                                        <code className="text-xs">
                                                            {formatAddress(event.data.owner || event.data.donor!)}
                                                        </code>
                                                    </div>
                                                    {event.data.campaignID && (
                                                        <div className="flex items-center gap-2">
                                                            <Hash className="h-3 w-3" />
                                                            Campaign: <code className="text-xs">{event.data.campaignID}</code>
                                                        </div>
                                                    )}
                                                    <div className="font-semibold text-blue-600">
                                                        Amount: {event.data.amount} ETH
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="text-xs text-muted-foreground">
                                            Block: {event.blockNumber.toLocaleString()} | 
                                            Tx: {formatAddress(event.transactionHash)}
                                        </div>
                                    </div>
                                </div>
                                
                                {idx < events.length - 1 && <Separator className="my-4" />}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No events found</p>
                        <p className="text-sm">Contract events will appear here as they happen</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}