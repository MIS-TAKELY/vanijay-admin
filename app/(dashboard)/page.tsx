'use client';

import { useQuery, gql } from '@apollo/client';
import SalesChart from '@/components/dashboard/SalesChart';
import {
  Users,
  ShoppingBag,
  DollarSign,
  Package,
  TrendingUp,
  ChevronRight,
  Activity,
  CreditCard,
  ArrowUpRight,
  Search
} from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/button';

const DASHBOARD_STATS = gql`
  query DashboardStats {
    dashboardStats {
      totalUsers
      totalOrders
      totalSales
    }
  }
`;

export default function DashboardPage() {
  const { data, loading, error } = useQuery(DASHBOARD_STATS);

  if (error) return (
    <div className="p-20 text-center space-y-4">
      <Activity className="h-12 w-12 text-destructive mx-auto animate-pulse" />
      <h2 className="text-2xl font-black italic">Telemetry Link Severed</h2>
      <p className="text-muted-foreground uppercase text-[10px] tracking-widest font-black">Data Stream Synchronization Error</p>
    </div>
  );

  const stats = [
    {
      label: 'Aggregate Revenue',
      value: `Rs. ${data?.dashboardStats?.totalSales?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: 'emerald',
      trend: '+12.5% vs Last Period'
    },
    {
      label: 'Operation Volume',
      value: data?.dashboardStats?.totalOrders || 0,
      icon: Package,
      color: 'amber',
      trend: '98% Success Rate'
    },
    {
      label: 'Entity Registry',
      value: data?.dashboardStats?.totalUsers || 0,
      icon: Users,
      color: 'indigo',
      trend: 'Active Nodes'
    },
    {
      label: 'Asset Catalog',
      value: '120',
      icon: ShoppingBag,
      color: 'rose',
      trend: 'Verified SKUs'
    },
  ];

  return (
    <div className="space-y-10 pb-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-5xl font-black tracking-tighter text-foreground italic flex items-center gap-4">
            <Activity className="h-12 w-12 text-primary" />
            Terminal Dashboard
          </h1>
          <p className="text-muted-foreground font-black flex items-center gap-2 uppercase text-[10px] tracking-[0.3em] opacity-60 pl-1">
            System Telemetry & Real-time Metrics
          </p>
        </div>
        <Button variant="outline" className="h-12 px-6 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] border-primary/20 hover:bg-primary/5 transition-all">
          <TrendingUp className="h-4 w-4 mr-2" /> Operational Report
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <MetricCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4 rounded-[2.5rem] border bg-card p-8 shadow-2xl shadow-primary/5 border-border/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp className="h-32 w-32" />
          </div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black italic tracking-tight">Revenue Trajectory</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Temporal Analysis</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Live Stream</span>
            </div>
          </div>
          <div className="h-[350px]">
            <SalesChart />
          </div>
        </div>

        <div className="lg:col-span-3 rounded-[2.5rem] border bg-card p-8 shadow-2xl shadow-primary/5 border-border/40 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black italic tracking-tight">Recent Ledger</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Latest Transactions</p>
            </div>
            <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest">
              History <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>

          <div className="space-y-6 flex-1 overflow-y-auto pr-2 scrollbar-thin">
            {[
              { name: 'Olivia Martin', email: 'olivia.martin@email.com', amount: '+Rs. 1,999.00', color: 'text-emerald-600' },
              { name: 'Jackson Lee', email: 'jackson.lee@email.com', amount: '+Rs. 39.00', color: 'text-emerald-600' },
              { name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', amount: '+Rs. 299.00', color: 'text-emerald-600' },
              { name: 'William Kim', email: 'will@email.com', amount: '+Rs. 99.00', color: 'text-emerald-600' },
              { name: 'Sofia Davis', email: 'sofia.davis@email.com', amount: '+Rs. 39.00', color: 'text-emerald-600' },
            ].map((sale, i) => (
              <div key={i} className="flex items-center group/item hover:bg-muted/50 p-2 rounded-2xl transition-all cursor-default border border-transparent hover:border-border/40">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary text-xs shadow-sm group-hover/item:bg-primary group-hover/item:text-white transition-all">
                  {sale.name[0]}
                </div>
                <div className="ml-4 space-y-0.5">
                  <p className="text-sm font-bold leading-none tracking-tight">{sale.name}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 tracking-tighter">{sale.email}</p>
                </div>
                <div className={clsx("ml-auto font-black italic tabular-nums", sale.color)}>{sale.amount}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-border/40">
            <div className="bg-primary/5 rounded-2xl p-4 flex items-center justify-between border border-primary/10">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary leading-none">Global Health</p>
                <p className="text-xs font-bold mt-1 tracking-tight">System fully operational.</p>
              </div>
              <CreditCard className="h-5 w-5 text-primary opacity-40" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, color, trend }: { label: string, value: string | number, icon: any, color: string, trend: string }) {
  const colorClasses: Record<string, string> = {
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700 shadow-emerald-500/5',
    amber: 'bg-amber-50 border-amber-100 text-amber-700 shadow-amber-500/5',
    indigo: 'bg-indigo-50 border-indigo-100 text-indigo-700 shadow-indigo-500/5',
    rose: 'bg-rose-50 border-rose-100 text-rose-700 shadow-rose-500/5'
  };

  return (
    <div className={clsx("p-8 rounded-[2.5rem] border shadow-xl flex flex-col justify-between h-48 transition-all hover:scale-[1.02] relative overflow-hidden group hover:border-primary/20", colorClasses[color])}>
      <div className="absolute -right-4 -top-4 p-8 opacity-5 group-hover:opacity-20 transition-all rotate-12 group-hover:rotate-0 transform duration-500">
        <Icon className="h-24 w-24" />
      </div>
      <div className="flex flex-row items-center justify-between z-10">
        <span className="text-[11px] font-black uppercase tracking-[0.2em] opacity-70 italic">{label}</span>
        <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center shadow-lg group-hover:shadow-primary/20 transition-all">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="z-10 flex flex-col">
        <div className="text-3xl font-black italic tracking-tighter tabular-nums mb-1">{value}</div>
        <div className="flex items-center gap-1.5 opacity-60">
          <ArrowUpRight className="h-3 w-3" />
          <span className="text-[9px] font-black uppercase tracking-widest">{trend}</span>
        </div>
      </div>
    </div>
  );
}
