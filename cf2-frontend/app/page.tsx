export const dynamic = "force-dynamic";

import { Header } from "@/components/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateCampaign } from "@/components/create-campaign";
import { Donate } from "@/components/donate";
import { Withdraw } from "@/components/withdraw";
import { Refund } from "@/components/refund";
import { CampaignDetails } from "@/components/campaign-details";
import { CampaignDonors } from "@/components/campaign-donors";
import { EventsFeed } from "@/components/events-feed";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30 dark:from-slate-900 dark:via-purple-950/10 dark:to-blue-950/10">
      <Header />

      <main className="w-full max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            Campaign Management Dashboard
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive interface for CF2 smart contract interactions
          </p>
          <div className="mt-6 flex justify-center">
            <div className="h-1 w-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
          </div>
        </div>

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-purple-100 dark:border-purple-800/30 shadow-lg">
            <TabsTrigger
              value="create"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              Create
            </TabsTrigger>
            <TabsTrigger
              value="donate"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              Donate
            </TabsTrigger>
            <TabsTrigger
              value="withdraw"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              Withdraw
            </TabsTrigger>
            <TabsTrigger
              value="refund"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              Refund
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              Details
            </TabsTrigger>
            <TabsTrigger
              value="donors"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              Donors
            </TabsTrigger>
            <TabsTrigger
              value="events"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              Events
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <CreateCampaign />
              </div>
              <div>
                <EventsFeed />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="donate" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <Donate />
              </div>
              <div className="lg:col-span-2">
                <EventsFeed />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="withdraw" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Withdraw />
              <EventsFeed />
            </div>
          </TabsContent>

          <TabsContent value="refund" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Refund />
              <EventsFeed />
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <CampaignDetails />
              </div>
              <div>
                <EventsFeed />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="donors" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <CampaignDonors />
              </div>
              <div>
                <EventsFeed />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <EventsFeed />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
