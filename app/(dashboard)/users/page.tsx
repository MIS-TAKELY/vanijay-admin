'use client';

import { useQuery, gql } from '@apollo/client';
import { clsx } from 'clsx';
import { MoreHorizontal } from 'lucide-react';

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
      role
      isSeller
      createdAt
    }
  }
`;

export default function UsersPage() {
    const { data, loading, error } = useQuery(GET_USERS);

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">Error: {error.message}</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                    Add User
                </button>
            </div>

            <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Is Seller</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Created At</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {data?.users?.map((user: any) => (
                                <tr
                                    key={user.id}
                                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                >
                                    <td className="p-4 align-middle font-medium">{user.name || 'N/A'}</td>
                                    <td className="p-4 align-middle">{user.email}</td>
                                    <td className="p-4 align-middle">{user.role}</td>
                                    <td className="p-4 align-middle">
                                        <span
                                            className={clsx(
                                                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                                                user.isSeller
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                                            )}
                                        >
                                            {user.isSeller ? 'Yes' : 'No'}
                                        </span>
                                    </td>
                                    <td className="p-4 align-middle">{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td className="p-4 align-middle">
                                        <button className="ghost h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
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
