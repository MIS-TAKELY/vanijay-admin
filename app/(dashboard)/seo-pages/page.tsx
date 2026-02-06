"use client";

import { useQuery, useMutation, gql } from "@apollo/client";
import {
    Globe,
    RefreshCcw,
    Trash2,
    ExternalLink,
    Search,
    AlertCircle,
    CheckCircle2,
    Clock,
    Plus
} from "lucide-react";
import { useState } from "react";
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
    }
  }
`;

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
                                {page.isIndexed ? (
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                ) : (
                                    <Clock className="h-4 w-4 text-amber-500" />
                                )}
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
                                    onClick={() => regenerateSeoPage({ variables: { id: page.id } })}
                                >
                                    Regenerate
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
                                >
                                    <a href={`https://vanijay.com${page.urlPath}`} target="_blank">
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

    const categories = catData?.categories || [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.categoryId || !formData.urlPath) {
            toast.error("Category and URL Path are required");
            return;
        }

        await createSeoPage({
            variables: {
                input: {
                    ...formData,
                    priceThreshold: formData.priceThreshold ? parseInt(formData.priceThreshold) : null,
                }
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Custom SEO Page</DialogTitle>
                    <DialogDescription>
                        Manually define a landing page for specific keywords or price points.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label>Target Category</Label>
                        <Select
                            onValueChange={(val) => {
                                const cat = categories.find((c: any) => c.id === val);
                                setFormData({
                                    ...formData,
                                    categoryId: val,
                                    urlPath: formData.urlPath || `/best-${cat?.slug || ""}`
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
                                placeholder="/best-phones"
                                value={formData.urlPath}
                                onChange={(e) => setFormData({ ...formData, urlPath: e.target.value })}
                            />
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
