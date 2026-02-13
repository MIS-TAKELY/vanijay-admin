'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import {
    MoreHorizontal,
    Search,
    RotateCcw,
    ShoppingBag,
    DollarSign,
    Layers,
    AlertCircle,
    ChevronRight,
    ChevronLeft,
    ChevronLeftSquare,
    ChevronRightSquare,
    Edit3,
    Check,
    X,
    Package,
    Store
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import { clsx } from "clsx";
import BulkProductImport from "@/components/product/BulkProductImport";

const GET_PRODUCTS = gql`
  query GetProducts($take: Int, $skip: Int, $search: String) {
    products(take: $take, skip: $skip, search: $search) {
      items {
        id
        name
        price
        stock
        status
        category
        sellerName
      }
      totalCount
    }
  }
`;

const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: String!, $price: Float, $stock: Int, $status: String) {
    updateProduct(id: $id, price: $price, stock: $stock, status: $status) {
      id
      price
      stock
      status
    }
  }
`;

export default function ProductsPage() {
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const router = useRouter();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<{ id: string, name: string } | null>(null);
    const [isForceDelete, setIsForceDelete] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const { data, loading, error, refetch } = useQuery(GET_PRODUCTS, {
        variables: { take: pageSize, skip: (currentPage - 1) * pageSize, search }
    });

    const [updateProduct] = useMutation(UPDATE_PRODUCT);

    // Add delete mutation
    const DELETE_PRODUCT = gql`
        mutation DeleteProduct($id: String!, $force: Boolean) {
            deleteProduct(id: $id, force: $force)
        }
    `;
    const [deleteProduct, { loading: deleteLoading }] = useMutation(DELETE_PRODUCT);

    const products = data?.products?.items || [];
    const totalCount = data?.products?.totalCount || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleDeleteClick = (product: { id: string, name: string }) => {
        setProductToDelete(product);
        setIsForceDelete(false);
        setDeleteError(null);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;

        try {
            await deleteProduct({
                variables: {
                    id: productToDelete.id,
                    force: isForceDelete
                }
            });

            toast.success("Product Deleted", {
                description: `Successfully deleted ${productToDelete.name}`
            });
            setIsDeleteModalOpen(false);
            setProductToDelete(null);
            refetch();
        } catch (err: any) {
            if (err.message.includes("associated orders") && !isForceDelete) {
                setDeleteError(err.message);
                setIsForceDelete(true);
            } else {
                toast.error("Deletion Failed", {
                    description: err.message
                });
                setIsDeleteModalOpen(false); // Close on generic error to avoid stuck state
            }
        }
    };

    if (error) return (
        <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-2xl font-black italic">Inventory Link Failure</h2>
            <p className="text-muted-foreground">{error.message}</p>
            <Button onClick={() => refetch()}>Reconnect Grid</Button>
        </div>
    );

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tighter text-foreground italic flex items-center gap-3">
                        <ShoppingBag className="h-10 w-10 text-primary" />
                        Inventory Control
                    </h1>
                    <p className="text-muted-foreground font-medium flex items-center gap-2 uppercase text-[10px] tracking-widest opacity-60">
                        <Package className="h-3 w-3" /> Global Distribution Registry
                    </p>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <BulkProductImport onSuccess={() => refetch()} />
                    <div className="relative w-full md:w-80 group">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                        <Input
                            placeholder="Scan for SKU or Product Name..."
                            className="pl-10 h-10 rounded-xl bg-card border-border/50 shadow-inner focus-visible:ring-primary/20 transition-all font-medium"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1); // Reset to first page on search
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatusCard label="Total Catalog" value={totalCount} icon={Layers} color="indigo" />
                <StatusCard label="Active Sellers" value={new Set(products.map((p: any) => p.sellerName)).size} icon={Store} color="emerald" />
                <StatusCard label="Aggregated Value" value={`Rs. ${products.reduce((acc: any, p: any) => acc + (p.price * p.stock), 0).toLocaleString()}`} icon={DollarSign} color="amber" />
            </div>

            <div className="rounded-[2.5rem] border bg-card shadow-2xl shadow-primary/5 overflow-hidden border-border/50">
                <div className="relative w-full overflow-auto">
                    {loading ? (
                        <div className="p-20 text-center flex flex-col items-center justify-center gap-4">
                            <div className="h-12 w-12 animate-spin rounded-full border-[6px] border-primary border-t-transparent shadow-xl shadow-primary/20"></div>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground animate-pulse leading-none">Initializing Data Streams...</p>
                        </div>
                    ) : (
                        <>
                            <table className="w-full caption-bottom text-sm border-collapse">
                                <thead className="bg-muted/30 border-b border-border/50">
                                    <tr>
                                        <th className="h-16 px-6 text-left font-black uppercase tracking-widest text-[10px] text-muted-foreground border-r border-border/20">Product Entity</th>
                                        <th className="h-16 px-6 text-center font-black uppercase tracking-widest text-[10px] text-muted-foreground border-r border-border/20">Valuation</th>
                                        <th className="h-16 px-6 text-center font-black uppercase tracking-widest text-[10px] text-muted-foreground border-r border-border/20">Availability</th>
                                        <th className="h-16 px-6 text-left font-black uppercase tracking-widest text-[10px] text-muted-foreground border-r border-border/20">Classification</th>
                                        <th className="h-16 px-6 text-left font-black uppercase tracking-widest text-[10px] text-muted-foreground">Origin</th>
                                        <th className="h-16 px-6 text-center font-black uppercase tracking-widest text-[10px] text-muted-foreground">Operator</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30 text-foreground">
                                    {products.map((product: any) => (
                                        <tr
                                            key={product.id}
                                            className="transition-all duration-300 group hover:bg-primary/[0.02] cursor-pointer"
                                            onClick={() => router.push(`/products/${product.id}`)}
                                        >
                                            <td className="p-6 align-middle font-bold text-base tracking-tight max-w-[300px] truncate border-r border-border/10">
                                                {product.name}
                                            </td>
                                            <td className="p-6 align-middle text-center border-r border-border/10">
                                                <InlineEdit
                                                    value={product.price}
                                                    onSave={(val) => updateProduct({
                                                        variables: { id: product.id, price: parseFloat(val) },
                                                        optimisticResponse: {
                                                            updateProduct: {
                                                                __typename: 'Product',
                                                                id: product.id,
                                                                price: parseFloat(val),
                                                                stock: product.stock,
                                                                status: product.status
                                                            }
                                                        }
                                                    })}
                                                    type="number"
                                                    prefix="Rs. "
                                                />
                                            </td>
                                            <td className="p-6 align-middle text-center border-r border-border/10">
                                                <InlineEdit
                                                    value={product.stock}
                                                    onSave={(val) => updateProduct({
                                                        variables: { id: product.id, stock: parseInt(val) },
                                                        optimisticResponse: {
                                                            updateProduct: {
                                                                __typename: 'Product',
                                                                id: product.id,
                                                                price: product.price,
                                                                stock: parseInt(val),
                                                                status: product.status
                                                            }
                                                        }
                                                    })}
                                                    type="number"
                                                />
                                            </td>
                                            <td className="p-6 align-middle border-r border-border/10">
                                                <span className="inline-flex items-center rounded-lg bg-muted px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] border border-border/50 text-muted-foreground">
                                                    {product.category || 'GENERIC_CLASS'}
                                                </span>
                                            </td>
                                            <td className="p-6 align-middle font-bold text-xs uppercase tracking-widest text-primary/60">
                                                {product.sellerName}
                                            </td>
                                            <td className="p-6 align-middle text-center">
                                                <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 rounded-lg shadow-sm font-black text-[9px] uppercase tracking-widest border-primary/20 text-primary hover:bg-primary/5"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            router.push(`/products/${product.id}`);
                                                        }}
                                                    >
                                                        Manage <Edit3 className="h-3 w-3 ml-1.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteClick(product);
                                                        }}
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
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
                                                    // Show first, last, and current neighbors
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

            {/* Custom Modal for Delete Confirmation */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-card w-full max-w-md rounded-2xl border shadow-xl p-6 space-y-6 animate-in zoom-in-95">
                        <div className="space-y-2 text-center">
                            <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                                <AlertCircle className="h-6 w-6 text-destructive" />
                            </div>
                            <h2 className="text-xl font-bold tracking-tight">
                                {deleteError ? "Force Delete Required" : "Confirm Deletion"}
                            </h2>
                            <p className="text-muted-foreground text-sm">
                                {deleteError
                                    ? <span className="text-destructive font-medium block mb-2">{deleteError}</span>
                                    : `Are you sure you want to delete "${productToDelete?.name}"?`
                                }
                                {deleteError
                                    ? "Do you want to force delete this product? This action cannot be undone and may affect historical order data."
                                    : "This action cannot be undone."
                                }
                            </p>
                        </div>
                        <div className="flex gap-4 justify-center">
                            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} disabled={deleteLoading}>
                                Cancel
                            </Button>
                            <Button
                                variant={deleteError ? "destructive" : "default"}
                                onClick={confirmDelete}
                                disabled={deleteLoading}
                                className={clsx(deleteError && "bg-destructive hover:bg-destructive/90")}
                            >
                                {deleteLoading ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                ) : (
                                    deleteError ? "Force Delete" : "Delete Product"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}

function StatusCard({ label, value, icon: Icon, color }: { label: string, value: string | number, icon: any, color: 'indigo' | 'emerald' | 'amber' }) {
    const colorClasses = {
        indigo: 'bg-indigo-50 border-indigo-100 text-indigo-700 shadow-indigo-500/10',
        emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700 shadow-emerald-500/10',
        amber: 'bg-amber-50 border-amber-100 text-amber-700 shadow-amber-500/10'
    };

    return (
        <div className={clsx("p-6 rounded-[2rem] border shadow-lg flex items-center justify-between transition-transform hover:scale-[1.02]", colorClasses[color])}>
            <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 leading-none">{label}</p>
                <p className="text-2xl font-black italic tracking-tighter">{value}</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-lg">
                <Icon className="h-6 w-6" />
            </div>
        </div>
    );
}

function InlineEdit({ value, onSave, type = "text", prefix = "" }: { value: any, onSave: (val: any) => Promise<any>, type?: string, prefix?: string }) {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value);
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        if (tempValue === value) {
            setIsEditing(false);
            return;
        }
        setIsLoading(true);
        try {
            await onSave(tempValue);
            setIsEditing(false);
            toast.success("Parameter Synchronized", {
                description: "The registry has been updated with the new valuation metrics."
            });
        } catch (err: any) {
            toast.error("Sync Protocol Failure", {
                description: err.message
            });
            setTempValue(value);
        } finally {
            setIsLoading(false);
        }
    };

    if (isEditing) {
        return (
            <div className="flex items-center justify-center gap-1 animate-in zoom-in-95 duration-200">
                <Input
                    type={type}
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="h-9 w-24 rounded-lg bg-card border-primary ring-2 ring-primary/20 font-black text-center"
                    autoFocus
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave();
                        if (e.key === 'Escape') {
                            setIsEditing(false);
                            setTempValue(value);
                        }
                    }}
                />
                <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 rounded-full" onClick={handleSave} disabled={isLoading}>
                    {isLoading ? <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Check className="h-4 w-4" />}
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-600 hover:bg-rose-50 rounded-full" onClick={() => { setIsEditing(false); setTempValue(value); }}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setIsEditing(true)}
            className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl transition-all hover:bg-primary/[0.05] group/edit min-w-[80px]"
        >
            <span className="font-black italic text-lg tracking-tighter">
                {prefix}{value}
            </span>
            <Edit3 className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover/edit:opacity-40 transition-opacity" />
        </button>
    );
}
