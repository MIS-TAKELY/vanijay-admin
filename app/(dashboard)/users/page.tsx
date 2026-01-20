'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { clsx } from 'clsx';
import {
    MoreHorizontal,
    Search,
    RotateCcw,
    ShieldAlert,
    ShieldCheck,
    Trash2,
    UserMinus,
    UserPlus,
    XCircle,
    Info,
    ChevronRight,
    ChevronLeft,
    SearchX,
    Users,
    Bookmark,
    Plus,
    X,
    Save
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const GET_USERS = gql`
  query GetUsers($take: Int, $skip: Int, $search: String, $role: String, $isBanned: Boolean, $sortBy: String) {
    users(take: $take, skip: $skip, search: $search, role: $role, isBanned: $isBanned, sortBy: $sortBy) {
      items {
        id
        name
        email
        role
        roles
        isSeller
        isBanned
        lastProductAdded
        createdAt
      }
      totalCount
    }
  }
`;

const BULK_BAN_USERS = gql`
  mutation BulkBanUsers($userIds: [String!]!) {
    bulkBanUsers(userIds: $userIds) {
      id
      isBanned
    }
  }
`;

const BULK_UNBAN_USERS = gql`
  mutation BulkUnbanUsers($userIds: [String!]!) {
    bulkUnbanUsers(userIds: $userIds) {
      id
      isBanned
    }
  }
`;

const BAN_USER = gql`
  mutation BanUser($userId: String!) {
    banUser(userId: $userId) {
      id
      isBanned
    }
  }
`;

const UNBAN_USER = gql`
  mutation UnbanUser($userId: String!) {
    unbanUser(userId: $userId) {
      id
      isBanned
    }
  }
`;

const DELETE_USER = gql`
  mutation DeleteUser($userId: String!) {
    deleteUser(userId: $userId)
  }
`;

const HARD_DELETE_USER = gql`
  mutation HardDeleteUser($userId: String!) {
    hardDeleteUser(userId: $userId)
  }
`;

const BULK_DELETE_USERS = gql`
  mutation BulkDeleteUsers($userIds: [String!]!, $force: Boolean) {
    bulkDeleteUsers(userIds: $userIds, force: $force) {
      success
      deletedCount
      message
    }
  }
`;


interface SavedView {
    id: string;
    name: string;
    filters: {
        role: string;
        isBanned: boolean | null;
        sortBy: string;
    }
}

export default function UsersPage() {
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [banFilter, setBanFilter] = useState<boolean | null>(null);
    const [sortFilter, setSortFilter] = useState('RECENTLY_CREATED');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [savedViews, setSavedViews] = useState<SavedView[]>([]);
    const [activeViewId, setActiveViewId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // Delete confirmation dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string, name: string } | null>(null);
    const [isHardDelete, setIsHardDelete] = useState(false);

    // Persistence Layer
    useEffect(() => {
        const stored = localStorage.getItem('vanijay_admin_user_views');
        if (stored) {
            try {
                setSavedViews(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse saved views");
            }
        }
    }, []);

    const saveViewsToStorage = (views: SavedView[]) => {
        localStorage.setItem('vanijay_admin_user_views', JSON.stringify(views));
    };

    const handleSaveView = () => {
        const name = prompt("Enter a name for this view:");
        if (!name) return;

        const newView: SavedView = {
            id: crypto.randomUUID(),
            name,
            filters: {
                role: roleFilter,
                isBanned: banFilter,
                sortBy: sortFilter
            }
        };

        const updated = [...savedViews, newView];
        setSavedViews(updated);
        saveViewsToStorage(updated);
        setActiveViewId(newView.id);
        toast.success("View Persisted", {
            description: `The "${name}" configuration is now accessible from your saved bookmarks.`
        });
    };

    const applyView = (view: SavedView) => {
        setRoleFilter(view.filters.role);
        setBanFilter(view.filters.isBanned);
        setSortFilter(view.filters.sortBy);
        setActiveViewId(view.id);
        setCurrentPage(1); // Reset pagination
    };

    const deleteView = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = savedViews.filter(v => v.id !== id);
        setSavedViews(updated);
        saveViewsToStorage(updated);
        if (activeViewId === id) setActiveViewId(null);
    };

    const { data, loading, error, refetch } = useQuery(GET_USERS, {
        variables: {
            take: pageSize,
            skip: (currentPage - 1) * pageSize,
            search: search || undefined,
            role: roleFilter || undefined,
            isBanned: banFilter === null ? undefined : banFilter,
            sortBy: sortFilter
        }
    });

    const [banUser] = useMutation(BAN_USER);
    const [unbanUser] = useMutation(UNBAN_USER);
    const [bulkBan] = useMutation(BULK_BAN_USERS);
    const [bulkUnban] = useMutation(BULK_UNBAN_USERS);
    const [deleteUser] = useMutation(DELETE_USER);
    const [hardDeleteUser] = useMutation(HARD_DELETE_USER);
    const [bulkDeleteUsers] = useMutation(BULK_DELETE_USERS);

    const users = data?.users?.items || [];
    const totalCount = data?.users?.totalCount || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    console.log("user --->",users);

    const handleBanToggle = async (user: any) => {
        const promise = user.isBanned
            ? unbanUser({
                variables: { userId: user.id },
                optimisticResponse: {
                    unbanUser: {
                        __typename: 'User',
                        id: user.id,
                        isBanned: false,
                    }
                }
            })
            : banUser({
                variables: { userId: user.id },
                optimisticResponse: {
                    banUser: {
                        __typename: 'User',
                        id: user.id,
                        isBanned: true,
                    }
                }
            });

        const actionLabel = user.isBanned ? 'restored' : 'restricted';

        toast.promise(promise, {
            loading: user.isBanned ? 'Registry Restore Initiated...' : 'Restriction Protocol Active...',
            success: (data: any) => {
                return `Entity ${user.name || 'Anonymous'} has been ${actionLabel}.`;
            },
            error: 'Registry Sync Failure.'
        });
    };

    const handleBulkAction = async (action: 'BAN' | 'UNBAN') => {
        const promise = action === 'BAN'
            ? bulkBan({ variables: { userIds: selectedIds } })
            : bulkUnban({ variables: { userIds: selectedIds } });

        toast.promise(promise, {
            loading: action === 'BAN' ? `Banning ${selectedIds.length} users...` : `Unbanning ${selectedIds.length} users...`,
            success: () => {
                setSelectedIds([]);
                refetch();
                return `Successfully processed ${selectedIds.length} users.`;
            },
            error: 'Bulk operation failed.'
        });
    };

    const handleDeleteUser = (user: any) => {
        setDeleteTarget({ id: user.id, name: user.name || 'Anonymous' });
        setIsHardDelete(false);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;

        const mutation = isHardDelete ? hardDeleteUser : deleteUser;
        const actionLabel = isHardDelete ? 'permanently deleted' : 'soft deleted';

        const promise = mutation({
            variables: { userId: deleteTarget.id }
        });

        toast.promise(promise, {
            loading: isHardDelete ? 'Permanently deleting user...' : 'Deleting user...',
            success: () => {
                setDeleteDialogOpen(false);
                setDeleteTarget(null);
                setIsHardDelete(false);
                refetch();
                return `User ${deleteTarget.name} has been ${actionLabel}.`;
            },
            error: 'Failed to delete user.'
        });
    };

    const handleBulkDelete = async (force: boolean) => {
        const promise = bulkDeleteUsers({
            variables: { userIds: selectedIds, force }
        });

        toast.promise(promise, {
            loading: force ? `Permanently deleting ${selectedIds.length} users...` : `Deleting ${selectedIds.length} users...`,
            success: (data: any) => {
                setSelectedIds([]);
                refetch();
                return data.data.bulkDeleteUsers.message || `Successfully deleted ${selectedIds.length} users.`;
            },
            error: 'Bulk delete operation failed.'
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === users.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(users.map((u: any) => u.id) || []);
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const resetFilters = () => {
        setSearch('');
        setRoleFilter('');
        setBanFilter(null);
        setSortFilter('RECENTLY_CREATED');
        setActiveViewId(null);
        setCurrentPage(1); // Reset pagination
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    if (error) return (
        <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
            <XCircle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-2xl font-black italic">Connection Interrupted</h2>
            <p className="text-muted-foreground">{error.message}</p>
            <Button onClick={() => window.location.reload()}>Retry Link</Button>
        </div>
    );

    return (
        <div className="space-y-8 pb-32">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tighter text-foreground">Operational Entities</h1>
                    <p className="text-muted-foreground font-medium flex items-center gap-2 uppercase text-[10px] tracking-widest opacity-60">
                        <Users className="h-3 w-3" /> Registry Management Area
                    </p>
                </div>

                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input
                        placeholder="Scan registry by name or email..."
                        className="pl-10 h-10 rounded-xl bg-card border-border/50 shadow-inner focus-visible:ring-primary/20 transition-all font-medium"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1); // Reset pagination on search
                        }}
                    />
                </div>
            </div>

            {/* Saved Views Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <Button
                    variant={activeViewId === null ? "default" : "ghost"}
                    size="sm"
                    onClick={resetFilters}
                    className="h-9 px-4 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-2 whitespace-nowrap"
                >
                    <LayersIcon className="h-3 w-3" /> Global Registry
                </Button>

                {savedViews.map(view => (
                    <div key={view.id} className="group relative flex items-center">
                        <Button
                            variant={activeViewId === view.id ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => applyView(view)}
                            className={clsx(
                                "h-9 pl-4 pr-10 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-2 whitespace-nowrap transition-all",
                                activeViewId === view.id ? "bg-primary/10 text-primary border-primary/20" : "bg-card border-border/40 hover:bg-muted"
                            )}
                        >
                            <Bookmark className="h-3 w-3" /> {view.name}
                        </Button>
                        <button
                            onClick={(e) => deleteView(view.id, e)}
                            className="absolute right-3 p-1 rounded-full hover:bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="h-3 w-3 text-muted-foreground" />
                        </button>
                    </div>
                ))}

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSaveView}
                    className="h-9 w-9 rounded-full border border-dashed border-border/60 hover:border-primary/40 hover:text-primary transition-all"
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex flex-wrap items-center gap-6 bg-card border border-border/40 p-6 rounded-[2rem] shadow-sm relative group/filters">
                <FilterGroup label="Classification" value={roleFilter} onChange={(val) => {
                    setRoleFilter(val);
                    setCurrentPage(1); // Reset pagination on filter
                }}>
                    <option value="">Global Taxonomy</option>
                    <option value="BUYER">Procurement (Buyer)</option>
                    <option value="SELLER">Distributor (Seller)</option>
                    <option value="BOTH">Dual Entity</option>
                </FilterGroup>

                <FilterGroup
                    label="Status Protocol"
                    value={banFilter === null ? '' : banFilter.toString()}
                    onChange={(val) => {
                        setBanFilter(val === '' ? null : val === 'true');
                        setCurrentPage(1); // Reset pagination on filter
                    }}
                >
                    <option value="">All Lifecycle States</option>
                    <option value="true">Restricted Access</option>
                    <option value="false">Active Link</option>
                </FilterGroup>

                <FilterGroup label="Log Sequence" value={sortFilter} onChange={(val) => {
                    setSortFilter(val);
                    setCurrentPage(1); // Reset pagination on filter
                }}>
                    <option value="RECENTLY_CREATED">Recent Genesis</option>
                    <option value="OLDEST_CREATED">Original Node</option>
                    <option value="LAST_PRODUCT_ADDED">Activity Spike</option>
                </FilterGroup>

                <div className="flex items-center gap-2 mt-5">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetFilters}
                        className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                    >
                        <RotateCcw className="h-3 w-3 mr-2" />
                        Purge
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSaveView}
                        className="text-[10px] font-black uppercase tracking-widest text-primary border-primary/20 hover:bg-primary/5 rounded-xl px-4"
                    >
                        <Save className="h-3 w-3 mr-2" />
                        Commit View
                    </Button>
                </div>
            </div>

            <div className="rounded-[2.5rem] border bg-card shadow-xl shadow-primary/5 overflow-hidden transition-all">
                <div className="relative w-full overflow-auto">
                    {loading && !data ? (
                        <div className="p-20 text-center flex flex-col items-center justify-center gap-4">
                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-lg shadow-primary/20"></div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse leading-none">Scanning Data Blocks...</p>
                        </div>
                    ) : (
                        <>
                            <table className="w-full caption-bottom text-sm">
                                <thead className="bg-muted/50 border-b">
                                    <tr>
                                        <th className="h-14 w-12 px-4 text-center">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-border/50 text-primary accent-primary"
                                                checked={selectedIds.length === users.length && users.length > 0}
                                                onChange={toggleSelectAll}
                                            />
                                        </th>
                                        <th className="h-14 px-4 text-left font-black uppercase tracking-widest text-[10px] text-muted-foreground">Subject</th>
                                        <th className="h-14 px-4 text-left font-black uppercase tracking-widest text-[10px] text-muted-foreground">Digital Signature</th>
                                        <th className="h-14 px-4 text-left font-black uppercase tracking-widest text-[10px] text-muted-foreground">Protocol</th>
                                        <th className="h-14 px-4 text-left font-black uppercase tracking-widest text-[10px] text-muted-foreground">Timestamp</th>
                                        <th className="h-14 px-4 text-center font-black uppercase tracking-widest text-[10px] text-muted-foreground">Control</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/40 text-foreground">
                                    {users.map((user: any) => {
                                        const roles = user.roles || [];
                                        const isBuyer = roles.includes('BUYER');
                                        const isSeller = roles.includes('SELLER');
                                        let roleDisplay = user.role;
                                        if (isBuyer && isSeller) roleDisplay = 'Dual Link';
                                        else if (isSeller) roleDisplay = 'Distributor';
                                        else if (isBuyer) roleDisplay = 'Procurer';

                                        const isSelected = selectedIds.includes(user.id);

                                        return (
                                            <tr
                                                key={user.id}
                                                className={clsx(
                                                    "transition-all duration-300 group hover:bg-muted/30",
                                                    isSelected && "bg-primary/5 active:bg-primary/10"
                                                )}
                                            >
                                                <td className="p-4 text-center">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-border/50 text-primary accent-primary"
                                                        checked={isSelected}
                                                        onChange={() => toggleSelect(user.id)}
                                                    />
                                                </td>
                                                <td className="p-4 align-middle font-bold text-base tracking-tight">{user.name || 'ANONYMOUS_UNIT'}</td>
                                                <td className="p-4 align-middle text-muted-foreground font-medium">{user.email}</td>
                                                <td className="p-4 align-middle">
                                                    <span
                                                        className={clsx(
                                                            'inline-flex items-center rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em] border',
                                                            isSeller ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-slate-50 text-slate-700 border-slate-100'
                                                        )}
                                                    >
                                                        {roleDisplay}
                                                    </span>
                                                </td>
                                                <td className="p-4 align-middle text-muted-foreground font-black text-[10px] uppercase opacity-60">
                                                    {new Date(user.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                                </td>
                                                <td className="p-4 align-middle text-center">
                                                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleBanToggle(user)}
                                                            className={clsx(
                                                                "h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                                                user.isBanned
                                                                    ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                                                    : "text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                                            )}
                                                        >
                                                            {user.isBanned ? <ShieldCheck className="h-3 w-3 mr-1" /> : <ShieldAlert className="h-3 w-3 mr-1" />}
                                                            {user.isBanned ? 'Restore' : 'Restrict'}
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteUser(user)}
                                                            className="h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest text-red-600 hover:text-red-700 hover:bg-red-50 transition-all"
                                                        >
                                                            <Trash2 className="h-3 w-3 mr-1" />
                                                            Delete
                                                        </Button>
                                                        <Button variant="secondary" size="sm" asChild className="h-8 rounded-lg shadow-sm">
                                                            <a href={`/users/${user.id}`} className="text-[10px] font-black uppercase tracking-widest flex items-center">
                                                                View Logs <ChevronRight className="h-3 w-3 ml-1" />
                                                            </a>
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="p-32 text-center text-muted-foreground italic flex flex-col items-center justify-center gap-4">
                                                <SearchX className="h-10 w-10 opacity-20" />
                                                <p className="text-lg font-bold opacity-60 italic">Registry Query Returned Zero Results.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            {totalPages > 1 && (
                                <div className="p-6 flex items-center justify-between border-t border-border/30 bg-muted/5">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} Entities
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 rounded-lg border-border/40"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>

                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                                .filter(page => {
                                                    return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                                                })
                                                .map((page, index, array) => (
                                                    <div key={page} className="flex items-center gap-1">
                                                        {index > 0 && array[index - 1] !== page - 1 && (
                                                            <span className="text-muted-foreground font-black px-1">...</span>
                                                        )}
                                                        <Button
                                                            variant={currentPage === page ? "default" : "outline"}
                                                            size="sm"
                                                            className={clsx(
                                                                "h-8 w-8 rounded-lg font-black text-[10px]",
                                                                currentPage === page ? "shadow-lg shadow-primary/20" : "border-border/40"
                                                            )}
                                                            onClick={() => handlePageChange(page)}
                                                        >
                                                            {page}
                                                        </Button>
                                                    </div>
                                                ))}
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 rounded-lg border-border/40"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Floating Action Bar */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 duration-500">
                    <div className="bg-card/80 backdrop-blur-xl border border-primary/20 rounded-[2rem] p-4 pr-6 flex items-center gap-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] shadow-primary/10">
                        <div className="flex items-center gap-4 px-4 border-r border-border/50">
                            <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-lg shadow-lg shadow-primary/30">
                                {selectedIds.length}
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest leading-none">Entities Selected</p>
                                <p className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-tighter">Bulk Action Protocol Active</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                className="h-12 px-6 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] border-emerald-500/20 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all flex items-center gap-2"
                                onClick={() => handleBulkAction('UNBAN')}
                            >
                                <UserPlus className="h-4 w-4" /> Global Restore
                            </Button>
                            <Button
                                variant="outline"
                                className="h-12 px-6 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] border-rose-500/20 text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all flex items-center gap-2"
                                onClick={() => handleBulkAction('BAN')}
                            >
                                <UserMinus className="h-4 w-4" /> Global Restrict
                            </Button>
                            <Button
                                variant="destructive"
                                className="h-12 px-6 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-rose-500/20 transition-all flex items-center gap-2"
                                onClick={() => {
                                    setDeleteTarget({ id: 'bulk', name: `${selectedIds.length} users` });
                                    setIsHardDelete(false);
                                    setDeleteDialogOpen(true);
                                }}
                            >
                                <Trash2 className="h-4 w-4" /> Delete Selected
                            </Button>
                        </div>

                        <div className="ml-4 pl-4 border-l border-border/50">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedIds([])}
                                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground"
                            >
                                Cancel Session
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            {deleteDialogOpen && deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card border border-border/40 rounded-[2rem] p-8 max-w-md w-full mx-4 shadow-2xl shadow-black/20 animate-in zoom-in-95 duration-200">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="h-12 w-12 rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-black tracking-tight mb-2">Confirm Deletion</h2>
                                <p className="text-sm text-muted-foreground">
                                    {deleteTarget.id === 'bulk'
                                        ? `You are about to delete ${deleteTarget.name}.`
                                        : `You are about to delete user "${deleteTarget.name}".`
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="bg-muted/50 border border-border/40 rounded-xl p-4 mb-6">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={isHardDelete}
                                    onChange={(e) => setIsHardDelete(e.target.checked)}
                                    className="h-4 w-4 mt-0.5 rounded border-border/50 text-red-600 accent-red-600 cursor-pointer"
                                />
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-foreground group-hover:text-red-600 transition-colors">
                                        Hard Delete (Permanent)
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Permanently remove all user data including products, orders, reviews, and related records. This action cannot be undone.
                                    </p>
                                </div>
                            </label>
                        </div>

                        {!isHardDelete && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                                <p className="text-xs text-blue-800 flex items-start gap-2">
                                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <span>Soft delete will ban the user but keep their data in the database for record-keeping purposes.</span>
                                </p>
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 h-11 rounded-xl font-bold"
                                onClick={() => {
                                    setDeleteDialogOpen(false);
                                    setDeleteTarget(null);
                                    setIsHardDelete(false);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                className="flex-1 h-11 rounded-xl font-bold shadow-lg shadow-red-500/20"
                                onClick={() => {
                                    if (deleteTarget.id === 'bulk') {
                                        handleBulkDelete(isHardDelete);
                                    } else {
                                        confirmDelete();
                                    }
                                    setDeleteDialogOpen(false);
                                }}
                            >
                                {isHardDelete ? 'Delete Permanently' : 'Delete'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function FilterGroup({ label, value, onChange, children }: { label: string, value: any, onChange: (v: any) => void, children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-2 min-w-[200px]">
            <label className="text-[10px] font-black uppercase text-primary tracking-[0.3em] pl-1 flex items-center gap-2 opacity-80 leading-none">
                <Info className="h-3 w-3" /> {label}
            </label>
            <select
                className="flex h-11 w-full rounded-2xl border border-border/60 bg-background px-4 py-2 text-sm font-bold shadow-sm transition-all focus:ring-2 focus:ring-primary/20 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23000%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')] bg-[length:1.25em] bg-[right_0.75rem_center] bg-no-repeat"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                {children}
            </select>
        </div>
    );
}

function LayersIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
        </svg>
    )
}
