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
    Pin
} from "lucide-react";
import { useState, useCallback, useRef } from "react";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

// ─── GraphQL ────────────────────────────────────────────────────────────────

const GET_SEO_PAGES = gql`
  query GetSeoPages {
    seoPages {
      id
      urlPath
      priceThreshold
      metaTitle
      isIndexed
      isStale
      lastGeneratedAt
      pinnedProductIds
      category {
        id
        name
      }
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SeoPagesPage() {
    const [search, setSearch] = useState("");
    const { data, loading, error, refetch } = useQuery(GET_SEO_PAGES);

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

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [managingPage, setManagingPage] = useState<any>(null);

    const pages = data?.seoPages || [];
    const filteredPages = pages.filter((p: any) =>
        p.urlPath.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.name.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="p-8">Loading SEO data streams...</div>;
    if (error) return <div className="p-8 text-red-500">Error: {error.message}</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter flex items-center gap-2">
                        <Globe className="h-8 w-8 text-primary" />
                        SEO Page Controller
                    </h1>
                    <p className="text-muted-foreground">Manage dynamic category portfolio pages</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setIsCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Custom Page
                    </Button>
                    <Button onClick={() => generateSeoPages()} disabled={isGenerating}>
                        {isGenerating ? <RefreshCcw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
                        Generate All Missing Pages
                    </Button>
                </div>
            </div>

            <CreateSeoPageDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                onSuccess={() => refetch()}
            />

            {managingPage && (
                <ManageProductsDialog
                    page={managingPage}
                    open={!!managingPage}
                    onOpenChange={(open) => { if (!open) setManagingPage(null); }}
                    onSuccess={() => refetch()}
                />
            )}

            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Filter by title or path..."
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPages.map((page: any) => (
                    <Card key={page.id} className="overflow-hidden border-border/50 hover:border-primary/50 transition-colors">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between mb-2">
                                <Badge variant={page.isStale ? "destructive" : "secondary"} className="text-[10px] uppercase font-bold tracking-widest">
                                    {page.isStale ? "Stale Data" : "Synchronized"}
                                </Badge>
                                <div className="flex items-center gap-2">
                                    {(page.pinnedProductIds?.length > 0) && (
                                        <Badge variant="outline" className="text-[10px] font-bold flex items-center gap-1 border-primary/40 text-primary">
                                            <Pin className="h-2.5 w-2.5" />
                                            {page.pinnedProductIds.length} pinned
                                        </Badge>
                                    )}
                                    {page.isIndexed ? (
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    ) : (
                                        <Clock className="h-4 w-4 text-amber-500" />
                                    )}
                                </div>
                            </div>
                            <CardTitle className="text-lg font-black tracking-tight">{page.category?.name}</CardTitle>
                            <CardDescription className="font-mono text-xs truncate">{page.urlPath}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                                Target: Under Rs. {page.priceThreshold}
                            </div>
                            <p className="text-sm line-clamp-2 text-muted-foreground italic">
                                {page.metaTitle}
                            </p>

                            <div className="flex items-center gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 text-[10px] font-bold uppercase tracking-widest"
                                    onClick={() => setManagingPage(page)}
                                >
                                    <Package className="mr-1.5 h-3.5 w-3.5" />
                                    Products
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-[10px] font-bold uppercase tracking-widest"
                                    onClick={() => regenerateSeoPage({ variables: { id: page.id } })}
                                >
                                    <RefreshCcw className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => {
                                        if (confirm("Delete this SEO page record?")) {
                                            deleteSeoPage({ variables: { id: page.id } });
                                        }
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                    disabled={!page.urlPath || page.urlPath === '/'}
                                >
                                    <a
                                        href={`https://vanijay.com${slugifyPath(page.urlPath)}`}
                                        target="_blank"
                                        title={page.urlPath || 'No path set'}
                                        onClick={(e) => {
                                            const path = page.urlPath;
                                            if (!path || path === '/') {
                                                e.preventDefault();
                                                alert(`This page has no valid URL path stored. Current value: "${path}"`);
                                            }
                                        }}
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

// ─── Create SEO Page Dialog ────────────────────────────────────────────────────

function CreateSeoPageDialog({ open, onOpenChange, onSuccess }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}) {
    const { data: catData } = useQuery(GET_CATEGORIES);
    const [createSeoPage, { loading }] = useMutation(CREATE_SEO_PAGE, {
        onCompleted: () => {
            toast.success("Custom SEO page created");
            onOpenChange(false);
            onSuccess();
            resetForm();
        },
        onError: (err) => toast.error(err.message)
    });

    const [formData, setFormData] = useState({
        categoryId: "",
        priceThreshold: "",
        urlPath: "",
        metaTitle: "",
        metaDescription: ""
    });
    const [pinnedProducts, setPinnedProducts] = useState<ProductMeta[]>([]);

    const categories = catData?.categories || [];

    const resetForm = () => {
        setFormData({ categoryId: "", priceThreshold: "", urlPath: "", metaTitle: "", metaDescription: "" });
        setPinnedProducts([]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.categoryId || !formData.urlPath) {
            toast.error("Category and URL Path are required");
            return;
        }
        const safeUrlPath = slugifyPath(formData.urlPath);

        await createSeoPage({
            variables: {
                input: {
                    ...formData,
                    urlPath: safeUrlPath,
                    priceThreshold: formData.priceThreshold ? parseInt(formData.priceThreshold) : null,
                    pinnedProductIds: pinnedProducts.map((p) => p.id),
                }
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetForm(); }}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Create Custom SEO Page</DialogTitle>
                    <DialogDescription>
                        Manually define a landing page for specific keywords or price points.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <Label>Target Category</Label>
                        <Select
                            onValueChange={(val) => {
                                const cat = categories.find((c: any) => c.id === val);
                                setFormData({
                                    ...formData,
                                    categoryId: val,
                                    urlPath: formData.urlPath || slugifyPath(`best-${cat?.slug || ""}`)
                                });
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat: any) => (
                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>URL Path</Label>
                            <Input
                                placeholder="/best-phones-under-20000"
                                value={formData.urlPath}
                                onChange={(e) => {
                                    const slugged = slugifyPath(e.target.value);
                                    setFormData({ ...formData, urlPath: slugged });
                                }}
                            />
                            <p className="text-xs text-muted-foreground">Auto-converted to slug format.</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Price Under (Optional)</Label>
                            <Input
                                type="number"
                                placeholder="50000"
                                value={formData.priceThreshold}
                                onChange={(e) => setFormData({ ...formData, priceThreshold: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Meta Title</Label>
                        <Input
                            placeholder="Best Smartphones in Nepal..."
                            value={formData.metaTitle}
                            onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Meta Description</Label>
                        <Input
                            placeholder="Compare and buy the best..."
                            value={formData.metaDescription}
                            onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                        />
                    </div>

                    {/* Product Picker */}
                    <div className="space-y-2 rounded-lg border border-dashed border-border p-4 bg-muted/30">
                        <div className="flex items-center gap-2 mb-1">
                            <Pin className="h-4 w-4 text-primary" />
                            <Label className="text-sm font-semibold">Pin Products to This Page</Label>
                            {pinnedProducts.length > 0 && (
                                <Badge variant="secondary" className="text-[10px]">{pinnedProducts.length} selected</Badge>
                            )}
                        </div>
                        <ProductPicker selected={pinnedProducts} onChange={setPinnedProducts} />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? "Creating..." : "Create Page"}
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
