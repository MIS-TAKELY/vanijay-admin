'use client';

import { useQuery, gql } from '@apollo/client';
import SalesChart from '@/components/dashboard/SalesChart';
import { Users, ShoppingBag, DollarSign, Package } from 'lucide-react';
import { clsx } from 'clsx';

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

  if (loading) return <div className="p-8">Loading stats...</div>;
  if (error) return <div className="p-8 text-red-500">Error loading stats</div>;

  const stats = [
    {
      label: 'Total Revenue',
      value: `Rs. ${data?.dashboardStats?.totalSales?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: 'text-green-500',
    },
    {
      label: 'Total Orders',
      value: data?.dashboardStats?.totalOrders || 0,
      icon: Package,
      color: 'text-blue-500',
    },
    {
      label: 'Total Users',
      value: data?.dashboardStats?.totalUsers || 0,
      icon: Users,
      color: 'text-purple-500',
    },
    {
      label: 'Active Products',
      value: '120', // Placeholder
      icon: ShoppingBag,
      color: 'text-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm"
            >
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <span className="text-sm font-medium">{stat.label}</span>
                <Icon className={clsx('h-4 w-4', stat.color)} />
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <SalesChart />
        </div>
        <div className="col-span-3 rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <h3 className="mb-4 text-lg font-semibold">Recent Sales</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">Olivia Martin</p>
                <p className="text-sm text-muted-foreground">olivia.martin@email.com</p>
              </div>
              <div className="ml-auto font-medium">+$1,999.00</div>
            </div>
            {/* More placeholdres */}
          </div>
        </div>
      </div>
    </div>
  );
}
