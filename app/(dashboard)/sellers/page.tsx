'use client';

import { useQuery, gql } from '@apollo/client';
import { MoreHorizontal } from 'lucide-react';

const GET_SELLERS = gql`
  query GetSellers {
    sellers {
      id
      shopName
      email
      verificationStatus
      totalSales
      isActive
    }
  }
`;

export default function SellersPage() {
    const { data, loading, error } = useQuery(GET_SELLERS);

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">Error: {error.message}</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Sellers</h1>
            </div>

            <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Shop Name</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Total Sales</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Active</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {data?.sellers?.map((seller: any) => (
                                <tr
                                    key={seller.id}
                                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                >
                                    <td className="p-4 align-middle font-medium">{seller.shopName}</td>
                                    <td className="p-4 align-middle">{seller.email || 'N/A'}</td>
                                    <td className="p-4 align-middle">{seller.verificationStatus}</td>
                                    <td className="p-4 align-middle">{seller.totalSales}</td>
                                    <td className="p-4 align-middle">{seller.isActive ? 'Yes' : 'No'}</td>
                                    <td className="p-4 align-middle">
                                        <button className="ghost h-8 w-8 p-0">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
