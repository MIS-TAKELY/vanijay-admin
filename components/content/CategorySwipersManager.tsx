"use client";

import { useState, useMemo } from "react";
import { useMutation } from "@apollo/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import {
    CREATE_CATEGORY_SWIPER,
    UPDATE_CATEGORY_SWIPER,
    DELETE_CATEGORY_SWIPER,
    GET_LANDING_PAGE_CATEGORY_SWIPERS,
} from "@/graphql/landing-page.queries";
import { buildCategoryTree, flattenCategories } from "@/lib/utils";

type CategorySwiper = {
    id: string;
    title: string;
    category: string;
    sortOrder: number;
    isActive: boolean;
};

type Props = {
    swipers: CategorySwiper[];
    refetch: () => void;
    categories: any[];
};

export default function CategorySwipersManager({ swipers, refetch, categories }: Props) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSwiper, setEditingSwiper] = useState<CategorySwiper | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        category: "",
        sortOrder: 0,
        isActive: true,
    });

    const [createSwiper, { loading: creating }] = useMutation(CREATE_CATEGORY_SWIPER, {
        update(cache, { data: { createCategorySwiper } }) {
            if (createCategorySwiper) {
                const existingData: any = cache.readQuery({ query: GET_LANDING_PAGE_CATEGORY_SWIPERS });
                if (existingData) {
                    cache.writeQuery({
                        query: GET_LANDING_PAGE_CATEGORY_SWIPERS,
                        data: {
                            getLandingPageCategorySwipers: [...existingData.getLandingPageCategorySwipers, createCategorySwiper],
                        },
                    });
                }
            }
        }
    });

    const [updateSwiper, { loading: updating }] = useMutation(UPDATE_CATEGORY_SWIPER);

    const [deleteSwiper, { loading: deleting }] = useMutation(DELETE_CATEGORY_SWIPER, {
        update(cache, _, { variables }) {
            const existingData: any = cache.readQuery({ query: GET_LANDING_PAGE_CATEGORY_SWIPERS });
            if (existingData) {
                cache.writeQuery({
                    query: GET_LANDING_PAGE_CATEGORY_SWIPERS,
                    data: {
                        getLandingPageCategorySwipers: existingData.getLandingPageCategorySwipers.filter(
                            (s: any) => s.id !== variables?.id
                        ),
                    },
                });
            }
        }
    });

    // Build category tree and flatten for display
    const categoryTree = useMemo(
        () => buildCategoryTree(categories),
        [categories]
    );
    const flatCategories = useMemo(
        () => flattenCategories(categoryTree),
        [categoryTree]
    );

    const handleOpenDialog = (swiper?: CategorySwiper) => {
        if (swiper) {
            setEditingSwiper(swiper);
            setFormData({
                title: swiper.title,
                category: swiper.category,
                sortOrder: swiper.sortOrder,
                isActive: swiper.isActive,
            });
        } else {
            setEditingSwiper(null);
            setFormData({
                title: "",
                category: "",
                sortOrder: swipers.length,
                isActive: true,
            });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const input = {
                title: formData.title,
                category: formData.category,
                sortOrder: formData.sortOrder,
                isActive: formData.isActive,
            };

            if (editingSwiper) {
                await updateSwiper({
                    variables: { id: editingSwiper.id, input },
                    optimisticResponse: {
                        updateCategorySwiper: {
                            __typename: "CategorySwiper",
                            id: editingSwiper.id,
                            title: input.title,
                            category: input.category,
                            sortOrder: input.sortOrder,
                            isActive: input.isActive,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        }
                    }
                });
                toast.success("Category swiper updated successfully");
            } else {
                await createSwiper({
                    variables: { input },
                });
                toast.success("Category swiper created successfully");
            }

            setIsDialogOpen(false);
            // refetch(); // No longer needed with cache updates
        } catch (error: any) {
            toast.error(error.message || "Failed to save category swiper");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this category swiper?")) return;

        try {
            await deleteSwiper({
                variables: { id },
                optimisticResponse: {
                    deleteCategorySwiper: true
                }
            });
            toast.success("Category swiper deleted successfully");
            // refetch(); // No longer needed with cache updates
        } catch (error: any) {
            toast.error(error.message || "Failed to delete category swiper");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category Swiper
                </Button>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12"></TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Sort Order</TableHead>
                            <TableHead>Active</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {swipers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                    No category swipers found. Create one to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            swipers.map((swiper) => (
                                <TableRow key={swiper.id}>
                                    <TableCell>
                                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                                    </TableCell>
                                    <TableCell className="font-medium">{swiper.title}</TableCell>
                                    <TableCell>{swiper.category}</TableCell>
                                    <TableCell>{swiper.sortOrder}</TableCell>
                                    <TableCell>
                                        <Switch checked={swiper.isActive} disabled />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleOpenDialog(swiper)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(swiper.id)}
                                                disabled={deleting}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingSwiper ? "Edit Category Swiper" : "Create Category Swiper"}
                        </DialogTitle>
                        <DialogDescription>
                            Configure a horizontal scrolling section for products in a specific category
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Best Deals on Electronics"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Category *</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) => setFormData({ ...formData, category: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                    {flatCategories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.slug || cat.name}>
                                            <div className="flex items-center">
                                                {Array.from({ length: cat.depth }).map((_, i) => (
                                                    <span
                                                        key={i}
                                                        className="inline-block w-4 border-l border-muted-foreground/30 h-4 ml-1 mr-1"
                                                    />
                                                ))}
                                                {cat.name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sortOrder">Sort Order *</Label>
                            <Input
                                id="sortOrder"
                                type="number"
                                value={formData.sortOrder}
                                onChange={(e) =>
                                    setFormData({ ...formData, sortOrder: parseInt(e.target.value) })
                                }
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(checked) =>
                                    setFormData({ ...formData, isActive: checked })
                                }
                            />
                            <Label htmlFor="isActive">Active</Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={creating || updating}>
                            {creating || updating ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
