'use client';

import { useQuery, gql } from '@apollo/client';
import { MoreHorizontal } from 'lucide-react';

const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      id
      name
      price
      stock
      status
      category
      sellerName
    }
  }
`;

export default function ProductsPage() {
    const { data, loading, error } = useQuery(GET_PRODUCTS);

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">Error: {error.message}</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Products</h1>
            </div>

            <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Price</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Stock</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Category</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Seller</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {data?.products?.map((product: any) => (
                                <tr
                                    key={product.id}
                                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                >
                                    <td className="p-4 align-middle font-medium">{product.name}</td>
                                    <td className="p-4 align-middle">Rs. {product.price}</td>
                                    <td className="p-4 align-middle">{product.stock}</td>
                                    <td className="p-4 align-middle">{product.status}</td>
                                    <td className="p-4 align-middle">{product.category}</td>
                                    <td className="p-4 align-middle">{product.sellerName}</td>
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
