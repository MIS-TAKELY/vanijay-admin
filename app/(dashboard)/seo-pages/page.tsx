"use client";

import { useQuery, useMutation, useLazyQuery, gql } from "@apollo/client";
import {
    Globe,
    RefreshCcw,
    Trash2,
    ExternalLink,
    Search,
    CheckCircle2,
    Clock,
    Plus,
    Package,
    X,
    Pin,
    Pencil,
    ChevronLeft,
    ChevronRight,
    Check,
    ChevronsUpDown
} from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

// ─── GraphQL ────────────────────────────────────────────────────────────────

const GET_SEO_PAGES = gql`
  query GetSeoPages($take: Int, $skip: Int, $search: String) {
    seoPages(take: $take, skip: $skip, search: $search) {
      items {
        id
        urlPath
        priceThreshold
        metaTitle
        metaDescription
        isIndexed
        isStale
        lastGeneratedAt
        pinnedProductIds
        categories {
          id
          name
        }
      }
      totalCount
    }
  }
`;

const GENERATE_SEO_PAGES = gql`
  mutation GenerateSeoPages {
    generateSeoPages {
      id
    }
  }
`;

const REGENERATE_SEO_PAGE = gql`
  mutation RegenerateSeoPage($id: String!) {
    regenerateSeoPage(id: $id) {
      id
      lastGeneratedAt
      isStale
    }
  }
`;

const DELETE_SEO_PAGE = gql`
  mutation DeleteSeoPage($id: String!) {
    deleteSeoPage(id: $id)
  }
`;

const GET_CATEGORIES = gql`
  query GetCategoriesForSeo {
    categories {
      id
      name
      slug
    }
  }
`;

const CREATE_SEO_PAGE = gql`
  mutation CreateSeoPage($input: CreateSeoPageInput!) {
    createSeoPage(input: $input) {
      id
      urlPath
      pinnedProductIds
    }
  }
`;

const UPDATE_SEO_PAGE = gql`
  mutation UpdateSeoPage($id: String!, $input: UpdateSeoPageInput!) {
    updateSeoPage(id: $id, input: $input) {
      id
      pinnedProductIds
    }
  }
`;

const SEARCH_PRODUCTS = gql`
  query SearchProducts($search: String, $take: Int) {
    products(search: $search, take: $take) {
      items {
        id
        name
        brand
        category
        status
      }
    }
  }
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugifyPath(input: string): string {
    const raw = input.startsWith('/') ? input.slice(1) : input;
    const slug = raw
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    return slug ? `/${slug}` : '/';
}

// ─── Product Picker Component ─────────────────────────────────────────────────

interface ProductMeta {
    id: string;
    name: string;
    brand?: string;
    category?: string;
}

function ProductPicker({
    selected,
    onChange,
}: {
    selected: ProductMeta[];
    onChange: (products: ProductMeta[]) => void;
}) {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [searchProducts, { data, loading }] = useLazyQuery(SEARCH_PRODUCTS);

    const handleQueryChange = useCallback((val: string) => {
        setQuery(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (val.trim().length < 1) {
            setIsOpen(false);
            return;
        }
        debounceRef.current = setTimeout(() => {
            searchProducts({ variables: { search: val.trim(), take: 15 } });
            setIsOpen(true);
        }, 350);
    }, [searchProducts]);

    const results: ProductMeta[] = (data?.products?.items || []).filter(
        (p: ProductMeta) => !selected.find((s) => s.id === p.id)
    );

    const addProduct = (product: ProductMeta) => {
        onChange([...selected, product]);
        setQuery("");
        setIsOpen(false);
    };

    const removeProduct = (id: string) => {
        onChange(selected.filter((p) => p.id !== id));
    };

    return (
        <div className="space-y-3">
            {/* Selected chips */}
            {selected.length > 0 && (
                <ScrollArea className="max-h-28">
                    <div className="flex flex-wrap gap-2 pr-1">
                        {selected.map((p) => (
                            <Badge
                                key={p.id}
                                variant="secondary"
                                className="flex items-center gap-1.5 py-1 px-2.5 text-xs font-medium max-w-[200px]"
                            >
                                <span className="truncate">{p.name}</span>
                                <button
                                    type="button"
                                    onClick={() => removeProduct(p.id)}
                                    className="ml-0.5 rounded-full hover:bg-muted-foreground/20 transition-colors flex-shrink-0"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                </ScrollArea>
            )}

            {/* Search input */}
            <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                    placeholder="Search products to pin..."
                    className="pl-9 pr-4"
                    value={query}
                    onChange={(e) => handleQueryChange(e.target.value)}
                    onFocus={() => { if (query.trim().length >= 1 && results.length > 0) setIsOpen(true); }}
                    onBlur={() => { setTimeout(() => setIsOpen(false), 200); }}
                    autoComplete="off"
                />

                {/* Dropdown */}
                {isOpen && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-lg shadow-xl overflow-hidden">
                        {loading ? (
                            <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
                                <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
                                Searching...
                            </div>
                        ) : results.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-muted-foreground">
                                No products found
                            </div>
                        ) : (
                            <ul className="max-h-52 overflow-y-auto divide-y divide-border/50">
                                {results.map((product) => (
                                    <li key={product.id}>
                                        <button
                                            type="button"
                                            className="w-full text-left px-4 py-2.5 hover:bg-accent transition-colors text-sm"
                                            onMouseDown={() => addProduct(product)}
                                        >
                                            <div className="font-medium truncate">{product.name}</div>
                                            <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                                                {product.brand && <span>{product.brand}</span>}
                                                {product.brand && product.category && <span>·</span>}
                                                {product.category && <span>{product.category}</span>}
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>

            {selected.length === 0 && (
                <p className="text-xs text-muted-foreground">
                    Leave empty to use the default resolver (auto-fetches by category & price).
                </p>
            )}
        </div>
    );
}

// ─── Category Picker Component ────────────────────────────────────────────────

interface CategoryMeta {
    id: string;
    name: string;
    slug: string;
}

function CategoryPicker({
    categories,
    selectedIds,
    onSelect,
    placeholder = "Select category..."
}: {
    categories: CategoryMeta[];
    selectedIds: string[];
    onSelect: (categoryId: string) => void;
    placeholder?: string;
}) {
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between rounded-xl bg-card border-border/80 h-11 hover:border-primary/30 transition-all font-normal"
                >
                    <span className="truncate text-muted-foreground italic">
                        {placeholder}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full min-w-[280px] p-0 rounded-xl border-border/60 shadow-2xl blur-backdrop bg-popover/90 backdrop-blur-md" align="start">
                <Command className="bg-transparent">
                    <CommandInput placeholder="Search categories..." className="h-11 border-none focus:ring-0" />
                    <CommandList className="max-h-64 overflow-y-auto">
                        <CommandEmpty>No category found.</CommandEmpty>
                        <CommandGroup>
                            {categories.map((category) => (
                                <CommandItem
                                    key={category.id}
                                    value={category.name}
                                    onSelect={() => {
                                        onSelect(category.id);
                                        setOpen(false);
                                    }}
                                    className="flex items-center justify-between py-2.5 px-3 cursor-pointer hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm">{category.name}</span>
                                        <span className="text-[10px] text-muted-foreground font-mono">/{category.slug}</span>
                                    </div>
                                    {selectedIds.includes(category.id) && (
                                        <Check className="h-4 w-4 text-primary" />
                                    )}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}


// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SeoPagesPage() {
    const [page, setPage] = useState(1);
    const pageSize = 12;
    const [searchInput, setSearchInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const handleSearchChange = (val: string) => {
        setSearchInput(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setSearchQuery(val);
            setPage(1);
        }, 400);
    };

    const { data, loading, error, refetch } = useQuery(GET_SEO_PAGES, {
        variables: { take: pageSize, skip: (page - 1) * pageSize, search: searchQuery },
        fetchPolicy: "network-only"
    });

    const [generateSeoPages, { loading: isGenerating }] = useMutation(GENERATE_SEO_PAGES, {
        onCompleted: () => {
            toast.success("SEO Pages generation task started");
            refetch();
        },
        onError: (err) => toast.error(err.message)
    });

    const [regenerateSeoPage] = useMutation(REGENERATE_SEO_PAGE, {
        onCompleted: () => toast.success("Page regenerated"),
        onError: (err) => toast.error(err.message)
    });

    const [deleteSeoPage] = useMutation(DELETE_SEO_PAGE, {
        onCompleted: () => {
            toast.success("Page deleted");
            refetch();
        },
        onError: (err) => toast.error(err.message)
    });

    const [managingPage, setManagingPage] = useState<any>(null);
    const [editingPage, setEditingPage] = useState<any>(null);

    const pages = data?.seoPages?.items || [];
    const totalCount = data?.seoPages?.totalCount || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    if (loading && pages.length === 0) return (
        <div className="flex flex-col items-center justify-center p-24 space-y-4 text-muted-foreground">
            <RefreshCcw className="h-8 w-8 animate-spin text-primary" />
            <p className="animate-pulse">Loading SEO ecosystem...</p>
        </div>
    );
    if (error) return <div className="flex flex-col items-center p-12 text-destructive font-semibold bg-destructive/10 rounded-xl my-8 mx-4">Error: {error.message}</div>;

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-br from-card to-background p-6 lg:p-8 rounded-3xl border border-border shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="relative z-10">
                    <h1 className="text-3xl lg:text-4xl font-black italic tracking-tighter flex items-center gap-3 text-foreground">
                        <Globe className="h-9 w-9 text-primary/80" />
                        SEO Ecosystem
                    </h1>
                    <p className="text-muted-foreground font-medium mt-1">Manage semantic endpoints & category visibility</p>
                </div>
                <div className="flex items-center gap-3 relative z-10">
                    <Button variant="outline" asChild className="rounded-xl border-dashed hover:border-solid hover:bg-accent/50 transition-all h-11 px-5">
                        <Link href="/seo-pages/new">
                            <Plus className="mr-2 h-4 w-4" />
                            New Endpoint
                        </Link>
                    </Button>
                    <Button onClick={() => generateSeoPages()} disabled={isGenerating} className="rounded-xl shadow-md h-11 px-5 hover:scale-[1.02] active:scale-95 transition-transform">
                        {isGenerating ? <RefreshCcw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
                        Sync Missing
                    </Button>
                </div>
            </div>

            {editingPage && (
                <EditSeoPageDialog open={Boolean(editingPage)} onOpenChange={(o) => { if (!o) setEditingPage(null); }} onSuccess={() => refetch()} page={editingPage} />
            )}
            
            {managingPage && (
                <ManageProductsDialog page={managingPage} open={Boolean(managingPage)} onOpenChange={(open) => { if (!open) setManagingPage(null); }} onSuccess={() => refetch()} />
            )}

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-1">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-4 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search queries, slugs, or titles..."
                        className="pl-11 h-11 rounded-xl bg-card border-border/60 hover:border-border transition-colors w-full"
                        value={searchInput}
                        onChange={(e) => handleSearchChange(e.target.value)}
                    />
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                    Indexing <span className="text-foreground">{totalCount}</span> dynamic routes
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {pages.map((page: any) => (
                    <Card key={page.id} className="group overflow-hidden rounded-2xl border-border/40 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 bg-gradient-to-b from-card to-background flex flex-col h-full">
                        <CardHeader className="pb-4 border-b border-border/30 bg-muted/20">
                            <div className="flex items-center justify-between mb-3">
                                <Badge variant={page.isStale ? "destructive" : "secondary"} className="text-[9px] uppercase font-bold tracking-wider rounded-md px-2 py-0.5 shadow-sm">
                                    {page.isStale ? "Stale" : "Synced"}
                                </Badge>
                                <div className="flex items-center gap-1.5 opacity-80">
                                    {page.pinnedProductIds?.length > 0 && (
                                        <Badge variant="outline" className="text-[9px] font-bold flex items-center gap-1 border-primary/20 text-primary bg-primary/5">
                                            <Pin className="h-2.5 w-2.5" />
                                            {page.pinnedProductIds.length}
                                        </Badge>
                                    )}
                                    {page.isIndexed ? (
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-1" />
                                    ) : (
                                        <Clock className="h-4 w-4 text-amber-500 ml-1" />
                                    )}
                                </div>
                            </div>
                            <CardTitle className="text-base font-bold tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                                {page.categories?.length > 0 ? page.categories.map((c: any) => c.name).join(", ") : "Uncategorized"}
                            </CardTitle>
                            <CardDescription className="font-mono text-[11px] truncate mt-1 text-primary/70">{page.urlPath}</CardDescription>
                        </CardHeader>
                        
                        <CardContent className="pt-4 flex-1 flex flex-col justify-between space-y-4">
                            <div>
                                <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest bg-muted/50 inline-block px-1.5 py-0.5 rounded mb-2">
                                    Under Rs. {page.priceThreshold || "N/A"}
                                </div>
                                <p className="text-xs line-clamp-3 text-muted-foreground/90 leading-relaxed group-hover:text-foreground transition-colors">
                                    {page.metaTitle || "No meta title specified"}
                                </p>
                            </div>

                            <div className="flex items-center gap-1.5 pt-4 mt-auto border-t border-border/30">
                                <Button variant="secondary" size="sm" className="flex-1 h-8 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors" onClick={() => setManagingPage(page)}>
                                    <Package className="mr-1.5 h-3.5 w-3.5" />
                                    Products
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-muted/40 hover:bg-accent hover:text-accent-foreground" onClick={() => setEditingPage(page)}>
                                    <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-muted/40 hover:bg-accent hover:text-accent-foreground" onClick={() => regenerateSeoPage({ variables: { id: page.id } })}>
                                    <RefreshCcw className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive" onClick={() => { if (confirm("Delete this SEO route permanently?")) { deleteSeoPage({ variables: { id: page.id } }); } }}>
                                    <Trash2 className="h-3.5 w-3.5 opacity-70" />
                                </Button>
                                <Button variant="ghost" size="icon" asChild disabled={!page.urlPath || page.urlPath === '/'} className="h-8 w-8 rounded-lg">
                                    <a href={`https://vanijay.com${page.urlPath}`} target="_blank" rel="noreferrer">
                                        <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                                    </a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            
            {pages.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center py-20 bg-muted/10 rounded-2xl border border-dashed border-border text-muted-foreground">
                    <Globe className="h-10 w-10 mb-3 opacity-20" />
                    <p>No SEO pages found matching your query.</p>
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t border-border/40 px-2">
                    <div className="text-sm font-medium text-muted-foreground">
                        Page <span className="text-foreground">{page}</span> of <span className="text-foreground">{totalPages}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="rounded-xl h-9 px-4">
                            <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-xl h-9 px-4">
                            Next <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Edit SEO Page Dialog ──────────────────────────────────────────────────────

function EditSeoPageDialog({ open, onOpenChange, onSuccess, page }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    page: any;
}) {
    const { data: catData } = useQuery(GET_CATEGORIES);
    const [updateSeoPage, { loading }] = useMutation(UPDATE_SEO_PAGE, {
        onCompleted: () => {
            toast.success("SEO Endpoint Updated");
            onOpenChange(false);
            onSuccess();
        },
        onError: (err) => toast.error(err.message)
    });

    const [formData, setFormData] = useState({
        categoryIds: [] as string[],
        priceThreshold: "",
        urlPath: "",
        metaTitle: "",
        metaDescription: ""
    });

    useEffect(() => {
        if (open && page) {
            setFormData({
                categoryIds: page.categories?.map((c: any) => c.id) || [],
                priceThreshold: page.priceThreshold ? String(page.priceThreshold) : "",
                urlPath: page.urlPath || "",
                metaTitle: page.metaTitle || "",
                metaDescription: page.metaDescription || ""
            });
        }
    }, [open, page]);

    const categories = catData?.categories || [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Let the backend handle thorough slugification, but we can do a base clean here
        const safeUrlPath = formData.urlPath ? `/${formData.urlPath.replace(/^\/+/, '')}` : "";

        await updateSeoPage({
            variables: {
                id: page.id,
                input: {
                    categoryIds: formData.categoryIds,
                    urlPath: safeUrlPath,
                    priceThreshold: formData.priceThreshold ? parseInt(formData.priceThreshold) : null,
                    metaTitle: formData.metaTitle,
                    metaDescription: formData.metaDescription
                }
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl p-0 overflow-hidden border-border/60 shadow-2xl rounded-2xl">
                <div className="bg-gradient-to-r from-muted/50 to-muted/10 p-6 border-b border-border/40">
                    <DialogHeader>
                        <DialogTitle className="text-xl flex items-center gap-2">
                            <Pencil className="h-5 w-5 text-primary" />
                            Edit Semantic Endpoint
                        </DialogTitle>
                        <DialogDescription className="mt-1">
                            Modify route routing and metadata definitions for {page?.urlPath}
                        </DialogDescription>
                    </DialogHeader>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2.5 col-span-2">
                            <Label className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Target Categories</Label>
                            <ScrollArea className="max-h-24 mb-2">
                                <div className="flex flex-wrap gap-2 min-h-[40px] p-2 rounded-xl border border-dashed border-border bg-muted/20">
                                    {formData.categoryIds.map((id) => {
                                        const cat = categories.find((c: any) => c.id === id);
                                        return (
                                            <Badge key={id} variant="secondary" className="pl-2 pr-1 h-7 rounded-lg group">
                                                {cat?.name || "..."}
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, categoryIds: formData.categoryIds.filter(cid => cid !== id) })}
                                                    className="ml-1 p-0.5 rounded-full hover:bg-destructive hover:text-white transition-colors"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        );
                                    })}
                                    {formData.categoryIds.length === 0 && (
                                        <span className="text-[10px] text-muted-foreground italic flex items-center h-7 px-2">No categories selected</span>
                                    )}
                                </div>
                            </ScrollArea>
                            <CategoryPicker
                                categories={categories}
                                selectedIds={formData.categoryIds}
                                placeholder="Add a category..."
                                onSelect={(val: string) => {
                                    if (!formData.categoryIds.includes(val)) {
                                        setFormData({ ...formData, categoryIds: [...formData.categoryIds, val] });
                                    }
                                }}
                            />
                        </div>
                        <div className="space-y-2.5">
                            <Label className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Price Under (Optional)</Label>
                            <Input
                                type="number"
                                placeholder="e.g. 50000"
                                className="rounded-xl bg-card border-border/80 h-11 focus:ring-primary/20"
                                value={formData.priceThreshold}
                                onChange={(e) => setFormData({ ...formData, priceThreshold: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2.5">
                        <Label className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">URL Path (Slug)</Label>
                        <div className="relative">
                            <div className="absolute left-3 top-2.5 text-muted-foreground font-mono">/</div>
                            <Input
                                placeholder="best-phones-under-20000"
                                className="rounded-xl bg-card border-border/80 pl-7 h-11 font-mono focus:ring-primary/20 text-sm"
                                value={formData.urlPath.replace(/^\/+/, '')}
                                onChange={(e) => setFormData({ ...formData, urlPath: `/${e.target.value}` })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2.5">
                        <Label className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Meta Title</Label>
                        <Input
                            placeholder="Best Smartphones in Nepal..."
                            className="rounded-xl bg-card border-border/80 h-11 focus:ring-primary/20 font-medium"
                            value={formData.metaTitle}
                            onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2.5">
                        <Label className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Meta Description</Label>
                        <textarea
                            className="flex min-h-[90px] w-full rounded-xl border border-border/80 bg-card px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-primary/20 resize-none"
                            placeholder="Compare and buy the best..."
                            value={formData.metaDescription}
                            onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                        />
                    </div>

                    <DialogFooter className="pt-2 border-t border-border/30 mt-6">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="rounded-xl px-8 shadow-md">
                            {loading ? "Saving..." : "Save Route"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}


// ─── Manage Products Dialog ───────────────────────────────────────────────────

function ManageProductsDialog({ page, open, onOpenChange, onSuccess }: {
    page: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}) {
    // Pre-load existing pinned product IDs as ProductMeta stubs (we only have IDs from the page data)
    // We'll fetch full details via a search on mount - but for simplicity, we just store the IDs.
    // The user can remove and re-add if needed.
    const [pinnedProducts, setPinnedProducts] = useState<ProductMeta[]>(() =>
        (page?.pinnedProductIds || []).map((id: string) => ({ id, name: `Product (${id.slice(0, 6)}…)` }))
    );
    const [isSaving, setIsSaving] = useState(false);

    const [updateSeoPage] = useMutation(UPDATE_SEO_PAGE, {
        onCompleted: () => {
            toast.success("Pinned products updated");
            onSuccess();
            onOpenChange(false);
        },
        onError: (err) => toast.error(err.message)
    });

    // Fetch full product details for existing pinned IDs if any
    const [fetchProducts] = useLazyQuery(SEARCH_PRODUCTS);

    // On open: resolve existing pinned IDs to real names
    const resolvedRef = useRef(false);
    if (open && !resolvedRef.current && page?.pinnedProductIds?.length > 0) {
        resolvedRef.current = true;
        // We need to find products — search each by a broader query is not feasible,
        // so we search the current pinned ones via the products query with no search (get all, match by id)
        fetchProducts({ variables: { take: 200 } }).then((res) => {
            const allProducts: ProductMeta[] = res.data?.products?.items || [];
            const resolved = (page.pinnedProductIds as string[]).map((id: string) => {
                const found = allProducts.find((p) => p.id === id);
                return found || { id, name: `ID: ${id.slice(0, 8)}…` };
            });
            setPinnedProducts(resolved);
        });
    }

    if (!open) {
        resolvedRef.current = false;
    }

    const handleSave = async () => {
        setIsSaving(true);
        await updateSeoPage({
            variables: {
                id: page.id,
                input: { pinnedProductIds: pinnedProducts.map((p) => p.id) }
            }
        });
        setIsSaving(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary" />
                        Manage Pinned Products
                    </DialogTitle>
                    <DialogDescription>
                        <span className="font-mono text-xs">{page?.urlPath}</span>
                        <br />
                        Pinned products are shown first on the buyer page. Leave empty to use the default resolver.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-2 space-y-2 rounded-lg border border-dashed border-border p-4 bg-muted/30">
                    <div className="flex items-center gap-2 mb-1">
                        <Pin className="h-4 w-4 text-primary" />
                        <Label className="text-sm font-semibold">Pinned Products</Label>
                        {pinnedProducts.length > 0 && (
                            <Badge variant="secondary" className="text-[10px]">{pinnedProducts.length} selected</Badge>
                        )}
                    </div>
                    <ProductPicker selected={pinnedProducts} onChange={setPinnedProducts} />
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (
                            <><RefreshCcw className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                        ) : (
                            "Save Changes"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
