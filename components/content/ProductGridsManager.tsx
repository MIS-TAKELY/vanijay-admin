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
    CREATE_PRODUCT_GRID,
    UPDATE_PRODUCT_GRID,
    DELETE_PRODUCT_GRID,
} from "@/graphql/landing-page.queries";
import { buildCategoryTree, flattenCategories } from "@/lib/utils";

type ProductGrid = {
    id: string;
    title: string;
    topDealAbout: string;
    productIds?: string[];
    sortOrder: number;
    isActive: boolean;
};

type Props = {
    grids: ProductGrid[];
    refetch: () => void;
    categories: any[];
};

export default function ProductGridsManager({ grids, refetch, categories }: Props) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingGrid, setEditingGrid] = useState<ProductGrid | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        topDealAbout: "",
        productIds: "",
        sortOrder: 0,
        isActive: true,
    });

    const [createGrid, { loading: creating }] = useMutation(CREATE_PRODUCT_GRID);
    const [updateGrid, { loading: updating }] = useMutation(UPDATE_PRODUCT_GRID);
    const [deleteGrid, { loading: deleting }] = useMutation(DELETE_PRODUCT_GRID);

    // Build category tree and flatten for display
    const categoryTree = useMemo(
        () => buildCategoryTree(categories),
        [categories]
    );
    const flatCategories = useMemo(
        () => flattenCategories(categoryTree),
        [categoryTree]
    );

    const handleOpenDialog = (grid?: ProductGrid) => {
        if (grid) {
            setEditingGrid(grid);
            setFormData({
                title: grid.title,
                topDealAbout: grid.topDealAbout,
                productIds: grid.productIds?.join(", ") || "",
                sortOrder: grid.sortOrder,
                isActive: grid.isActive,
            });
        } else {
            setEditingGrid(null);
            setFormData({
                title: "",
                topDealAbout: "",
                productIds: "",
                sortOrder: grids.length,
                isActive: true,
            });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const input = {
                title: formData.title,
                topDealAbout: formData.topDealAbout,
                productIds: formData.productIds
                    ? formData.productIds.split(",").map((id) => id.trim()).filter(Boolean)
                    : [],
                sortOrder: formData.sortOrder,
                isActive: formData.isActive,
            };

            if (editingGrid) {
                await updateGrid({
                    variables: { id: editingGrid.id, input },
                });
                toast.success("Product grid updated successfully");
            } else {
                await createGrid({
                    variables: { input },
                });
                toast.success("Product grid created successfully");
            }

            setIsDialogOpen(false);
            refetch();
        } catch (error: any) {
            toast.error(error.message || "Failed to save product grid");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product grid?")) return;

        try {
            await deleteGrid({ variables: { id } });
            toast.success("Product grid deleted successfully");
            refetch();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete product grid");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product Grid
                </Button>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12"></TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Category Filter</TableHead>
                            <TableHead>Product IDs</TableHead>
                            <TableHead>Sort Order</TableHead>
                            <TableHead>Active</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {grids.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                    No product grids found. Create one to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            grids.map((grid) => (
                                <TableRow key={grid.id}>
                                    <TableCell>
                                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                                    </TableCell>
                                    <TableCell className="font-medium">{grid.title}</TableCell>
                                    <TableCell>{grid.topDealAbout}</TableCell>
                                    <TableCell>
                                        {grid.productIds && grid.productIds.length > 0
                                            ? `${grid.productIds.length} products`
                                            : "Auto"}
                                    </TableCell>
                                    <TableCell>{grid.sortOrder}</TableCell>
                                    <TableCell>
                                        <Switch checked={grid.isActive} disabled />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleOpenDialog(grid)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(grid.id)}
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
                            {editingGrid ? "Edit Product Grid" : "Create Product Grid"}
                        </DialogTitle>
                        <DialogDescription>
                            Configure a grid layout section for products with custom filters
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Featured Products"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="topDealAbout">Category Filter *</Label>
                            <Select
                                value={formData.topDealAbout}
                                onValueChange={(value) => setFormData({ ...formData, topDealAbout: value })}
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
                            <p className="text-xs text-muted-foreground">
                                Category to filter products by
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="productIds">Product IDs (optional)</Label>
                            <Input
                                id="productIds"
                                value={formData.productIds}
                                onChange={(e) => setFormData({ ...formData, productIds: e.target.value })}
                                placeholder="id1, id2, id3"
                            />
                            <p className="text-xs text-muted-foreground">
                                Comma-separated list of specific product IDs to show. Leave empty for automatic selection.
                            </p>
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
