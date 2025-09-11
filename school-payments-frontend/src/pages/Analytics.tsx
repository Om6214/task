import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

function Analytics() {
  // Dummy Data
  const totalVolume = 125000;
  const numTransactions = 320;

  const statusData = [
    { name: "Successful", value: 220, color: "#22c55e" },
    { name: "Pending", value: 60, color: "#f59e0b" },
    { name: "Failed", value: 40, color: "#ef4444" },
  ];

  const paymentModeData = [
    { name: "Credit Card", value: 150, color: "#3b82f6" },
    { name: "Bank Transfer", value: 90, color: "#8b5cf6" },
    { name: "UPI", value: 50, color: "#ec4899" },
    { name: "Wallet", value: 30, color: "#f97316" },
  ];

  const schoolData = [
    { school: "School A", volume: 40000, fill: "#3b82f6" },
    { school: "School B", volume: 30000, fill: "#8b5cf6" },
    { school: "School C", volume: 20000, fill: "#ec4899" },
    { school: "School D", volume: 15000, fill: "#f97316" },
  ];

  const volumeOverTime = [
    { date: "Jan", volume: 10000 },
    { date: "Feb", volume: 15000 },
    { date: "Mar", volume: 20000 },
    { date: "Apr", volume: 25000 },
    { date: "May", volume: 18000 },
    { date: "Jun", volume: 32000 },
  ];

  const webhookData = [
    { status: "Success", value: 120, color: "#22c55e" },
    { status: "Failed", value: 20, color: "#ef4444" },
    { status: "Retried", value: 10, color: "#f59e0b" },
  ];

  const totalWebhooks = webhookData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="flex flex-col gap-6 p-6 bg-muted/40 min-h-screen">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of transaction metrics and performance indicators
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ₹{totalVolume.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" x2="22" y1="10" y2="10" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {numTransactions}
                </div>
                <p className="text-xs text-muted-foreground">
                  +180 from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {((statusData[0].value / numTransactions) * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  +5% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Status</CardTitle>
                <CardDescription>Distribution by status</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, value }) => {
                        const total = statusData.reduce((acc, cur) => acc + cur.value, 0);
                        const percent = total > 0 ? ((Number(value) ?? 0) / total) : 0;
                        return `${name}: ${(percent * 100).toFixed(0)}%`;
                      }}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value} transactions`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Payment Mode */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Distribution by payment type</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentModeData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, value }) => {
                        const total = paymentModeData.reduce((acc, cur) => acc + cur.value, 0);
                        const percent = total > 0 ? ((Number(value) ?? 0) / total) : 0;
                        return `${name}: ${(percent * 100).toFixed(0)}%`;
                      }}
                    >
                      {paymentModeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value} transactions`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* School Volume */}
            <Card>
              <CardHeader>
                <CardTitle>School-wise Volume</CardTitle>
                <CardDescription>Transaction volume by school</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={schoolData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="school" />
                    <YAxis 
                      tickFormatter={(value) => `₹${value/1000}k`}
                    />
                    <Tooltip 
                      formatter={(value) => [`₹${value.toLocaleString()}`, 'Volume']}
                    />
                    <Bar 
                      dataKey="volume" 
                      radius={[4, 4, 0, 0]}
                    >
                      {schoolData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Volume Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>Volume Over Time</CardTitle>
                <CardDescription>Monthly transaction volume</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={volumeOverTime}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(value) => `₹${value/1000}k`} />
                    <Tooltip 
                      formatter={(value) => [`₹${value.toLocaleString()}`, 'Volume']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="volume" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Webhook Status */}
          <Card>
            <CardHeader>
              <CardTitle>Webhook Status</CardTitle>
              <CardDescription>Delivery status of webhooks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {webhookData.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm font-medium">{item.status}</span>
                        <Badge variant="outline" className="ml-2">
                          {item.value}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {((item.value / totalWebhooks) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={(item.value / totalWebhooks) * 100} 
                      className="h-2"
                      style={{
                        backgroundColor: `${item.color}20`,
                        ["--progress-indicator" as any]: item.color,
                        borderRadius: "9999px"
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Analytics;