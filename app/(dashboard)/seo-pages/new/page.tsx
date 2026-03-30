"use client";

import { useQuery, useMutation, useLazyQuery, gql } from "@apollo/client";
import {
    Globe,
    RefreshCcw,
    ArrowLeft,
    Search,
    X,
    Plus,
    Pin,
    Check,
    ChevronsUpDown,
    Package,
    ChevronDown,
    ChevronUp,
    Layers,
    Hash,
    FileText,
    Sparkles,
    AlertCircle,
} from "lucide-react";
import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// ─── GraphQL ──────────────────────────────────────────────────────────────────

const GET_CATEGORIES = gql`
  query GetCategoriesForSeoNew {
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

const SEARCH_PRODUCTS = gql`
  query SearchProductsForSeoNew($search: String, $take: Int) {
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugifyPath(input: string): string {
    const raw = input.startsWith("/") ? input.slice(1) : input;
    const slug = raw
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
    return slug ? `/${slug}` : "/";
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryMeta {
    id: string;
    name: string;
    slug: string;
}

interface ProductMeta {
    id: string;
    name: string;
    brand?: string;
    category?: string;
}

interface CategorySection {
    categoryId: string;
    categoryName: string;
    categorySlug: string;
    products: ProductMeta[];
    limit: number;
    isExpanded: boolean;
}

// ─── Category Picker ─────────────────────────────────────────────────────────

function CategoryPicker({
    categories,
    selectedIds,
    onSelect,
}: {
    categories: CategoryMeta[];
    selectedIds: string[];
    onSelect: (category: CategoryMeta) => void;
}) {
    const [open, setOpen] = useState(false);
    const available = categories.filter((c) => !selectedIds.includes(c.id));

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between rounded-xl bg-card border-dashed border-border/80 h-11 hover:border-primary/50 hover:bg-accent/30 transition-all font-normal text-muted-foreground"
                >
                    <span className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add category section...
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full min-w-[320px] p-0 rounded-xl border-border/60 shadow-2xl" align="start">
                <Command className="bg-transparent">
                    <CommandInput placeholder="Search categories..." className="h-11 border-none focus:ring-0" />
                    <CommandList className="max-h-64 overflow-y-auto">
                        <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                            {available.length === 0 ? "All categories added." : "No category found."}
                        </CommandEmpty>
                        <CommandGroup>
                            {available.map((cat) => (
                                <CommandItem
                                    key={cat.id}
                                    value={cat.name}
                                    onSelect={() => {
                                        onSelect(cat);
                                        setOpen(false);
                                    }}
                                    className="flex items-center justify-between py-2.5 px-3 cursor-pointer"
                                >
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm">{cat.name}</span>
                                        <span className="text-[10px] text-muted-foreground font-mono">
                                            /{cat.slug}
                                        </span>
                                    </div>
                                    <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

// ─── Per-Category Product Picker ─────────────────────────────────────────────

function CategoryProductPicker({
    selected,
    limit,
    onChange,
}: {
    selected: ProductMeta[];
    limit: number;
    onChange: (products: ProductMeta[]) => void;
}) {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [searchProducts, { data, loading }] = useLazyQuery(SEARCH_PRODUCTS);

    const handleQueryChange = useCallback(
        (val: string) => {
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
        },
        [searchProducts]
    );

    const results: ProductMeta[] = (data?.products?.items || []).filter(
        (p: ProductMeta) => !selected.find((s) => s.id === p.id)
    );

    const atLimit = selected.length >= limit;

    const addProduct = (product: ProductMeta) => {
        if (atLimit) {
            toast.warning(`Limit reached: max ${limit} products for this section`);
            return;
        }
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
                                className="flex items-center gap-1.5 py-1 px-2.5 text-xs font-medium max-w-[220px] bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 transition-colors"
                            >
                                <Pin className="h-2.5 w-2.5 shrink-0" />
                                <span className="truncate">{p.name}</span>
                                <button
                                    type="button"
                                    onClick={() => removeProduct(p.id)}
                                    className="ml-0.5 rounded-full hover:bg-destructive/20 hover:text-destructive transition-colors flex-shrink-0"
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
                    placeholder={
                        atLimit
                            ? `Limit reached (${limit} products)`
                            : `Search & pin products... (${selected.length}/${limit})`
                    }
                    className={cn(
                        "pl-9 pr-4 rounded-lg bg-muted/30 border-border/60",
                        atLimit && "opacity-60 cursor-not-allowed"
                    )}
                    value={query}
                    disabled={atLimit}
                    onChange={(e) => handleQueryChange(e.target.value)}
                    onFocus={() => {
                        if (query.trim().length >= 1 && results.length > 0) setIsOpen(true);
                    }}
                    onBlur={() => {
                        setTimeout(() => setIsOpen(false), 200);
                    }}
                    autoComplete="off"
                />

                {/* Dropdown */}
                {isOpen && !atLimit && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-xl shadow-xl overflow-hidden">
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
                    Leave empty to auto-fetch by category. You can add up to{" "}
                    <strong>{limit}</strong> pinned products.
                </p>
            )}
        </div>
    );
}

// ─── Category Section Card ────────────────────────────────────────────────────

function CategorySectionCard({
    section,
    index,
    onRemove,
    onUpdate,
}: {
    section: CategorySection;
    index: number;
    onRemove: () => void;
    onUpdate: (updates: Partial<CategorySection>) => void;
}) {
    return (
        <div className="relative group">
            {/* Connector line for multiple sections */}
            {index > 0 && (
                <div className="absolute -top-4 left-6 w-0.5 h-4 bg-border/60" />
            )}

            <Card className={cn(
                "border-border/40 shadow-sm transition-all duration-200",
                "hover:border-primary/20 hover:shadow-md",
                section.isExpanded ? "border-primary/20 shadow-md ring-1 ring-primary/10" : ""
            )}>
                {/* Card header */}
                <CardHeader className="pb-3 pt-4 px-5">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            {/* Section number badge */}
                            <div className="flex-shrink-0 h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <span className="text-[11px] font-bold text-primary">{index + 1}</span>
                            </div>
                            <div className="min-w-0">
                                <CardTitle className="text-base font-bold tracking-tight truncate">
                                    {section.categoryName}
                                </CardTitle>
                                <CardDescription className="text-[11px] font-mono truncate">
                                    /{section.categorySlug}
                                </CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Products count indicator */}
                            {section.products.length > 0 && (
                                <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border border-primary/20 gap-1">
                                    <Pin className="h-2.5 w-2.5" />
                                    {section.products.length}/{section.limit}
                                </Badge>
                            )}
                            {/* Limit quick-view */}
                            <Badge variant="outline" className="text-[10px] gap-1 text-muted-foreground">
                                <Hash className="h-2.5 w-2.5" />
                                {section.limit} max
                            </Badge>
                            {/* Expand/Collapse */}
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-lg hover:bg-accent"
                                onClick={() => onUpdate({ isExpanded: !section.isExpanded })}
                            >
                                {section.isExpanded ? (
                                    <ChevronUp className="h-4 w-4" />
                                ) : (
                                    <ChevronDown className="h-4 w-4" />
                                )}
                            </Button>
                            {/* Remove */}
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                                onClick={onRemove}
                            >
                                <X className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                {/* Expanded content */}
                {section.isExpanded && (
                    <CardContent className="pt-0 pb-4 px-5 space-y-4">
                        <Separator className="mb-4" />

                        {/* Product limit control */}
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/40">
                            <Hash className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Max products to show
                                </Label>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                    Limits how many products appear in this section on the page
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg"
                                    onClick={() => onUpdate({ limit: Math.max(1, section.limit - 1) })}
                                    disabled={section.limit <= 1}
                                >
                                    <span className="text-base leading-none">−</span>
                                </Button>
                                <Input
                                    type="number"
                                    min={1}
                                    max={50}
                                    value={section.limit}
                                    onChange={(e) => {
                                        const v = parseInt(e.target.value);
                                        if (!isNaN(v) && v >= 1 && v <= 50) {
                                            onUpdate({
                                                limit: v,
                                                products: section.products.slice(0, v),
                                            });
                                        }
                                    }}
                                    className="h-8 w-14 text-center rounded-lg font-bold text-sm border-border/60 bg-card"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg"
                                    onClick={() => onUpdate({ limit: Math.min(50, section.limit + 1) })}
                                    disabled={section.limit >= 50}
                                >
                                    <span className="text-base leading-none">+</span>
                                </Button>
                            </div>
                        </div>

                        {/* Product picker */}
                        <div>
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                                <Pin className="h-3 w-3" />
                                Pinned Products
                            </Label>
                            <CategoryProductPicker
                                selected={section.products}
                                limit={section.limit}
                                onChange={(products) => onUpdate({ products })}
                            />
                        </div>
                    </CardContent>
                )}
            </Card>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function NewSeoPagePage() {
    const router = useRouter();
    const { data: catData, loading: catLoading } = useQuery(GET_CATEGORIES);
    const [createSeoPage, { loading: isCreating }] = useMutation(CREATE_SEO_PAGE, {
        onCompleted: () => {
            toast.success("SEO page created successfully!");
            router.push("/seo-pages");
        },
        onError: (err) => toast.error(err.message),
    });

    const categories: CategoryMeta[] = catData?.categories || [];

    // Form state
    const [sections, setSections] = useState<CategorySection[]>([]);
    const [meta, setMeta] = useState({
        urlPath: "",
        metaTitle: "",
        metaDescription: "",
        priceThreshold: "",
    });

    // ── Section management ──────────────────────────────────────────────────

    const addSection = (cat: CategoryMeta) => {
        const newSection: CategorySection = {
            categoryId: cat.id,
            categoryName: cat.name,
            categorySlug: cat.slug,
            products: [],
            limit: 10,
            isExpanded: true,
        };

        setSections((prev) => {
            const updated = [...prev, newSection];
            // Auto-generate URL from categories
            if (!meta.urlPath || meta.urlPath === "/") {
                const allSlugs = updated.map((s) => s.categorySlug).join("-");
                setMeta((m) => ({
                    ...m,
                    urlPath: slugifyPath(`best-${allSlugs}`),
                }));
            }
            return updated;
        });
    };

    const removeSection = (index: number) => {
        setSections((prev) => {
            const updated = prev.filter((_, i) => i !== index);
            // Regenerate URL if it was auto-set
            if (updated.length > 0) {
                const allSlugs = updated.map((s) => s.categorySlug).join("-");
                setMeta((m) => ({
                    ...m,
                    urlPath: slugifyPath(`best-${allSlugs}`),
                }));
            } else {
                setMeta((m) => ({ ...m, urlPath: "" }));
            }
            return updated;
        });
    };

    const updateSection = (index: number, updates: Partial<CategorySection>) => {
        setSections((prev) =>
            prev.map((s, i) => (i === index ? { ...s, ...updates } : s))
        );
    };

    // ── Submit ───────────────────────────────────────────────────────────────

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (sections.length === 0) {
            toast.error("Add at least one category section");
            return;
        }
        if (!meta.urlPath || meta.urlPath === "/") {
            toast.error("URL path is required");
            return;
        }

        // Collect all pinned product IDs from all sections (deduped)
        const allPinnedIds = Array.from(
            new Set(sections.flatMap((s) => s.products.map((p) => p.id)))
        );

        // All category IDs
        const categoryIds = sections.map((s) => s.categoryId);

        await createSeoPage({
            variables: {
                input: {
                    categoryIds,
                    urlPath: slugifyPath(meta.urlPath),
                    metaTitle: meta.metaTitle || null,
                    metaDescription: meta.metaDescription || null,
                    priceThreshold: meta.priceThreshold
                        ? parseInt(meta.priceThreshold)
                        : null,
                    pinnedProductIds: allPinnedIds,
                    structuredData: JSON.stringify(sections)
                },
            },
        });
    };

    // ── Derived ──────────────────────────────────────────────────────────────
    const selectedCategoryIds = sections.map((s) => s.categoryId);
    const totalPinnedProducts = sections.reduce(
        (acc, s) => acc + s.products.length,
        0
    );

    return (
        <div className="max-w-3xl mx-auto pb-16">
            {/* ── Page header ── */}
            <div className="mb-8">
                <Link
                    href="/seo-pages"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5 group"
                >
                    <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
                    Back to SEO Pages
                </Link>

                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black italic tracking-tighter flex items-center gap-3 text-foreground">
                            <div className="h-10 w-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <Globe className="h-5 w-5 text-primary" />
                            </div>
                            New SEO Endpoint
                        </h1>
                        <p className="text-muted-foreground mt-2 text-sm">
                            Define category sections, pin products, and set your page metadata.
                        </p>
                    </div>

                    {/* Summary badges */}
                    <div className="flex items-center gap-2 mt-1 flex-shrink-0">
                        {sections.length > 0 && (
                            <Badge variant="secondary" className="gap-1.5 text-xs">
                                <Layers className="h-3 w-3" />
                                {sections.length} section{sections.length !== 1 ? "s" : ""}
                            </Badge>
                        )}
                        {totalPinnedProducts > 0 && (
                            <Badge variant="secondary" className="gap-1.5 text-xs bg-primary/10 text-primary border border-primary/20">
                                <Pin className="h-3 w-3" />
                                {totalPinnedProducts} pinned
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* ── Step 1: Category Sections ── */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                        <div className="h-6 w-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                            1
                        </div>
                        <div>
                            <h2 className="text-base font-bold">Category Sections</h2>
                            <p className="text-xs text-muted-foreground">
                                Add categories — each becomes a section with its own product selection & limit.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3 pl-0">
                        {/* Existing sections */}
                        {sections.map((section, index) => (
                            <CategorySectionCard
                                key={section.categoryId}
                                section={section}
                                index={index}
                                onRemove={() => removeSection(index)}
                                onUpdate={(updates) => updateSection(index, updates)}
                            />
                        ))}

                        {/* Category picker */}
                        <CategoryPicker
                            categories={categories}
                            selectedIds={selectedCategoryIds}
                            onSelect={addSection}
                        />

                        {catLoading && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground px-2">
                                <RefreshCcw className="h-3 w-3 animate-spin" />
                                Loading categories...
                            </div>
                        )}

                        {sections.length === 0 && (
                            <div className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-border bg-muted/20 text-muted-foreground">
                                <AlertCircle className="h-4 w-4 flex-shrink-0 opacity-60" />
                                <p className="text-sm">
                                    No sections yet. Click the picker above to add your first category.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <Separator />

                {/* ── Step 2: Page Metadata ── */}
                <div className="space-y-5">
                    <div className="flex items-center gap-2.5">
                        <div className="h-6 w-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                            2
                        </div>
                        <div>
                            <h2 className="text-base font-bold">Page Metadata</h2>
                            <p className="text-xs text-muted-foreground">
                                URL path, meta tags, and optional price filter.
                            </p>
                        </div>
                    </div>

                    <Card className="border-border/40">
                        <CardContent className="pt-5 pb-5 space-y-5">
                            {/* URL Path */}
                            <div className="space-y-2">
                                <Label className="text-muted-foreground font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5">
                                    <Globe className="h-3 w-3" />
                                    URL Path
                                    <span className="text-destructive text-xs font-normal normal-case tracking-normal ml-0.5">
                                        *required
                                    </span>
                                </Label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm select-none">
                                        /
                                    </div>
                                    <Input
                                        placeholder="best-phones-under-20000"
                                        className="rounded-xl bg-card border-border/80 pl-6 h-11 font-mono focus:ring-primary/20 text-sm"
                                        value={meta.urlPath.replace(/^\/+/, "")}
                                        onChange={(e) =>
                                            setMeta((m) => ({
                                                ...m,
                                                urlPath: `/${e.target.value}`,
                                            }))
                                        }
                                        required
                                    />
                                </div>
                                <p className="text-[11px] text-muted-foreground">
                                    Auto-generated from your category selection. You can override it.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Meta Title */}
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5">
                                        <FileText className="h-3 w-3" />
                                        Meta Title
                                    </Label>
                                    <Input
                                        placeholder="Best Smartphones in Nepal..."
                                        className="rounded-xl bg-card border-border/80 h-11 focus:ring-primary/20"
                                        value={meta.metaTitle}
                                        onChange={(e) =>
                                            setMeta((m) => ({ ...m, metaTitle: e.target.value }))
                                        }
                                    />
                                </div>

                                {/* Price Threshold */}
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5">
                                        <Hash className="h-3 w-3" />
                                        Price Under (Optional)
                                    </Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium select-none">
                                            Rs.
                                        </span>
                                        <Input
                                            type="number"
                                            placeholder="50000"
                                            className="rounded-xl bg-card border-border/80 h-11 focus:ring-primary/20 pl-10"
                                            value={meta.priceThreshold}
                                            onChange={(e) =>
                                                setMeta((m) => ({
                                                    ...m,
                                                    priceThreshold: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Meta Description */}
                            <div className="space-y-2">
                                <Label className="text-muted-foreground font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5">
                                    <Sparkles className="h-3 w-3" />
                                    Meta Description
                                </Label>
                                <textarea
                                    className="flex min-h-[90px] w-full rounded-xl border border-border/80 bg-card px-3 py-2.5 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-primary/20 resize-none"
                                    placeholder="Compare and buy the best smartphones under Rs. 50,000 in Nepal..."
                                    value={meta.metaDescription}
                                    onChange={(e) =>
                                        setMeta((m) => ({
                                            ...m,
                                            metaDescription: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Action bar ── */}
                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => router.back()}
                        className="rounded-xl gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Cancel
                    </Button>

                    <div className="flex items-center gap-3">
                        {/* Preview summary */}
                        {sections.length > 0 && (
                            <div className="text-xs text-muted-foreground hidden sm:flex items-center gap-3">
                                <span className="flex items-center gap-1">
                                    <Layers className="h-3 w-3" />
                                    {sections.length} categor{sections.length !== 1 ? "ies" : "y"}
                                </span>
                                <span className="text-border">·</span>
                                <span className="flex items-center gap-1">
                                    <Package className="h-3 w-3" />
                                    {totalPinnedProducts} pinned product{totalPinnedProducts !== 1 ? "s" : ""}
                                </span>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={isCreating || sections.length === 0}
                            className="rounded-xl px-8 shadow-md gap-2 hover:scale-[1.02] active:scale-95 transition-transform"
                        >
                            {isCreating ? (
                                <>
                                    <RefreshCcw className="h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Globe className="h-4 w-4" />
                                    Create SEO Page
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
