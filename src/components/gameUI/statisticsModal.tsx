import { GameMenuCard } from "@/components/gameUI/gameMenuCard";
import { useStatisticsStore } from "@/stores/statisticsStore";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  TrendingUp,
  Calendar,
  Trophy,
  Target,
  Timer,
  LineChart,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUIStore } from "@/stores/uiStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const StatisticsModal = () => {
  const lifetimeStats = useStatisticsStore.use.lifetimeStats();
  const currentDay = useStatisticsStore.use.currentDay();
  const dailySnapshots = useStatisticsStore.use.dailySnapshots();
  const getBestDay = useStatisticsStore.use.getBestDay();
  const getDailyGrowthRate = useStatisticsStore.use.getDailyGrowthRate();
  const getTotalPlaytime = useStatisticsStore.use.getTotalPlaytime();

  const showStatistics = useUIStore.use.showStatistics();
  const setShowStatistics = useUIStore.use.setShowStatistics();

  const bestDay = getBestDay();
  const growthRate = getDailyGrowthRate();
  const totalPlaytime = getTotalPlaytime();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not achieved";
    return new Date(dateString).toLocaleDateString();
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  // Prepare data for the revenue graph
  const chartData = dailySnapshots.map((snapshot) => ({
    day: `Day ${snapshot.day}`,
    revenue: snapshot.dailyProfit,
  }));

  // Calculate min and max for better Y-axis scaling
  const revenues = chartData.map((d) => d.revenue);
  const minRevenue = revenues.length > 0 ? Math.min(...revenues, 0) : 0;
  const maxRevenue = revenues.length > 0 ? Math.max(...revenues, 100) : 100;

  return (
    <Dialog open={showStatistics} onOpenChange={setShowStatistics}>
      <DialogContent className="max-w-2xl !bg-white/50" showOverlay>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            Statistics
          </DialogTitle>
          <DialogDescription className="sr-only">
            View detailed statistics about your aquarium's performance and
            growth.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Graph</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <ScrollArea className="h-[70vh] p-4">
              <div className="space-y-6">
                {/* Today's Progress */}
                <div>
                  <h3 className="mb-3 flex items-center gap-2 font-semibold text-blue-600">
                    <Timer className="h-4 w-4" />
                    Today's Progress
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-green-50 p-3">
                      <div className="text-sm text-green-600">Money Earned</div>
                      <div className="text-lg font-bold text-green-800">
                        ${currentDay.moneyEarnedToday}
                      </div>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-3">
                      <div className="text-sm text-blue-600">
                        Visitors Served
                      </div>
                      <div className="text-lg font-bold text-blue-800">
                        {currentDay.visitorsToday}
                      </div>
                    </div>
                    <div className="rounded-lg bg-yellow-50 p-3">
                      <div className="text-sm text-yellow-600">
                        Coins Collected
                      </div>
                      <div className="text-lg font-bold text-yellow-800">
                        {currentDay.coinsCollectedToday}
                      </div>
                    </div>
                    <div className="rounded-lg bg-purple-50 p-3">
                      <div className="text-sm text-purple-600">Actions</div>
                      <div className="text-lg font-bold text-purple-800">
                        {currentDay.actionsToday}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Lifetime Totals */}
                <div>
                  <h3 className="mb-3 flex items-center gap-2 font-semibold text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    Lifetime Totals
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Money Earned:</span>
                      <Badge variant="outline">
                        ${lifetimeStats.totalMoneyEarned}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Money Spent:</span>
                      <Badge variant="outline">
                        ${lifetimeStats.totalMoneySpent}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Tanks Built:</span>
                      <Badge variant="outline">
                        {lifetimeStats.totalTanksBuilt}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Fish Purchased:</span>
                      <Badge variant="outline">
                        {lifetimeStats.totalFishPurchased}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Visitors Served:</span>
                      <Badge variant="outline">
                        {lifetimeStats.totalVisitorsServed}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Coins Collected:</span>
                      <Badge variant="outline">
                        {lifetimeStats.totalCoinsCollected}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Records */}
                <div>
                  <h3 className="mb-3 flex items-center gap-2 font-semibold text-orange-600">
                    <Trophy className="h-4 w-4" />
                    Records
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Highest Daily Profit:</span>
                      <Badge variant="secondary">
                        ${lifetimeStats.highestDailyProfit}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Most Visitors (One Day):</span>
                      <Badge variant="secondary">
                        {lifetimeStats.mostVisitorsInOneDay}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Highest Reputation:</span>
                      <Badge variant="secondary">
                        {lifetimeStats.highestReputation}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Largest Grid Size:</span>
                      <Badge variant="secondary">
                        {lifetimeStats.largestGridSize} tiles
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Most Fish in Tank:</span>
                      <Badge variant="secondary">
                        {lifetimeStats.mostFishInTank}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Longest Session:</span>
                      <Badge variant="secondary">
                        {formatDuration(lifetimeStats.longestPlaySession)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Milestones */}
                <div>
                  <h3 className="mb-3 flex items-center gap-2 font-semibold text-purple-600">
                    <Target className="h-4 w-4" />
                    Milestones
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">First Tank:</span>
                      <span className="text-xs text-gray-600">
                        {formatDate(lifetimeStats.firstTankDate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">First $100:</span>
                      <span className="text-xs text-gray-600">
                        {formatDate(lifetimeStats.first100DollarsDate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">First Expansion:</span>
                      <span className="text-xs text-gray-600">
                        {formatDate(lifetimeStats.firstExpansionDate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Max Grid Reached:</span>
                      <span className="text-xs text-gray-600">
                        {formatDate(lifetimeStats.maxGridReachedDate)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Analytics */}
                {dailySnapshots.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 font-semibold text-indigo-600">
                        <Calendar className="h-4 w-4" />
                        Analytics
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Days Played:</span>
                          <Badge variant="outline">
                            {dailySnapshots.length}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Growth Rate:</span>
                          <Badge
                            variant={
                              growthRate >= 0 ? "default" : "destructive"
                            }
                          >
                            {growthRate >= 0 ? "+" : ""}
                            {growthRate.toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Total Playtime:</span>
                          <Badge variant="outline">
                            {formatDuration(totalPlaytime)}
                          </Badge>
                        </div>
                        {bestDay && (
                          <div className="flex justify-between">
                            <span className="text-sm">Best Day Profit:</span>
                            <Badge variant="secondary">
                              ${bestDay.dailyProfit} (Day {bestDay.day})
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="revenue" className="p-4">
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-semibold text-green-600">
                <LineChart className="h-4 w-4" />
                Daily Revenue Trend
              </h3>
              {chartData.length > 0 ? (
                <div className="h-[60vh]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                        stroke="#e5e7eb"
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                        stroke="#e5e7eb"
                        domain={[minRevenue * 0.9, maxRevenue * 1.1]}
                        tickFormatter={(value) => `$${Math.round(value)}`}
                      />
                      <Tooltip
                        formatter={(value: number | string) => [
                          `$${Number(value).toFixed(0)}`,
                          "Daily Profit",
                        ]}
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "1px solid #e5e7eb",
                          borderRadius: "6px",
                          padding: "8px 12px",
                        }}
                        labelStyle={{ color: "#374151", fontWeight: "500" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: "#10b981", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-[60vh] items-center justify-center text-gray-500">
                  <p>
                    No revenue data available yet. Play more days to see trends!
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
