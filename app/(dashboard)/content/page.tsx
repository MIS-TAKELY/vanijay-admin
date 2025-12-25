'use client';

import { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { clsx } from 'clsx';
import { MoreHorizontal, Plus } from 'lucide-react';

const GET_CONTENT = gql`
  query GetContent {
    categories {
      id
      name
      slug
      isActive
      parentName
    }
    offers {
        id
        title
        type
        value
        isActive
        startDate
        endDate
    }
  }
`;

export default function ContentPage() {
    const { data, loading, error } = useQuery(GET_CONTENT);
    const [activeTab, setActiveTab] = useState('categories');

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">Error: {error.message}</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
            </div>

            <div className="flex space-x-4 border-b">
                <button
                    onClick={() => setActiveTab('categories')}
                    className={clsx(
                        'px-4 py-2 text-sm font-medium transition-colors border-b-2',
                        activeTab === 'categories'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                    )}
                >
                    Categories
                </button>
                <button
                    onClick={() => setActiveTab('offers')}
                    className={clsx(
                        'px-4 py-2 text-sm font-medium transition-colors border-b-2',
                        activeTab === 'offers'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                    )}
                >
                    Offers (Landing Page)
                </button>
            </div>

            {activeTab === 'categories' && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                            <Plus className="h-4 w-4" /> Add Category
                        </button>
                    </div>
                    <div className="rounded-md border">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Slug</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Parent</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Active</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {data?.categories?.map((cat: any) => (
                                    <tr key={cat.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle font-medium">{cat.name}</td>
                                        <td className="p-4 align-middle">{cat.slug}</td>
                                        <td className="p-4 align-middle">{cat.parentName || '-'}</td>
                                        <td className="p-4 align-middle">{cat.isActive ? 'Yes' : 'No'}</td>
                                        <td className="p-4 align-middle">
                                            <button className="ghost h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'offers' && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                            <Plus className="h-4 w-4" /> Add Offer Banner
                        </button>
                    </div>
                    <div className="rounded-md border">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Title</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Value</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Start Date</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Active</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {data?.offers?.map((offer: any) => (
                                    <tr key={offer.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle font-medium">{offer.title}</td>
                                        <td className="p-4 align-middle">{offer.type}</td>
                                        <td className="p-4 align-middle">{offer.value}</td>
                                        <td className="p-4 align-middle">{new Date(offer.startDate).toLocaleDateString()}</td>
                                        <td className="p-4 align-middle">{offer.isActive ? 'Yes' : 'No'}</td>
                                        <td className="p-4 align-middle">
                                            <button className="ghost h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
