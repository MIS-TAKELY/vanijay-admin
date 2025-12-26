"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const UPDATE_PRODUCT_CATEGORY = gql`
  mutation UpdateProductCategory($id: String!, $input: UpdateProductInput!) {
    updateProduct(id: $id, input: $input) {
      id
      category
    }
  }
`;

interface CategoryNode {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
    parentId?: string;
    children: CategoryNode[];
}

function flattenCategories(
    categories: CategoryNode[],
    depth = 0
): { id: string; name: string; depth: number }[] {
    let result: { id: string; name: string; depth: number }[] = [];
    categories.forEach((cat) => {
        result.push({ id: cat.id, name: cat.name, depth });
        if (cat.children && cat.children.length > 0) {
            result = result.concat(flattenCategories(cat.children, depth + 1));
        }
    });
    return result;
}

function buildCategoryTree(categories: any[]): CategoryNode[] {
    const map: { [key: string]: CategoryNode } = {};
    const tree: CategoryNode[] = [];

    categories.forEach((cat) => {
        map[cat.id] = { ...cat, children: [] };
    });

    categories.forEach((cat) => {
        if (cat.parentId && map[cat.parentId]) {
            map[cat.parentId].children.push(map[cat.id]);
        } else {
            tree.push(map[cat.id]);
        }
    });

    return tree;
}

interface EditCategoryDialogProps {
    product: any;
    categories: any[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function EditCategoryDialog({
    product,
    categories,
    open,
    onOpenChange,
}: EditCategoryDialogProps) {
    const router = useRouter();
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [updateProductCategory] = useMutation(UPDATE_PRODUCT_CATEGORY);

    // Build category tree and flatten for display
    const categoryTree = useMemo(
        () => buildCategoryTree(categories),
        [categories]
    );
    const flatCategories = useMemo(
        () => flattenCategories(categoryTree),
        [categoryTree]
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedCategoryId) {
            toast.error("Validation Error", {
                description: "Please select a category.",
            });
            return;
        }

        setIsLoading(true);
        try {
            await updateProductCategory({
                variables: {
                    id: product.id,
                    input: { categoryId: selectedCategoryId },
                },
            });
            toast.success("Category Updated", {
                description: "Product category has been successfully updated.",
            });
            onOpenChange(false);
            setSelectedCategoryId("");
            router.refresh();
        } catch (err: any) {
            toast.error("Update Failed", {
                description: err.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black tracking-tight">
                        Update Product Category
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Change the category for{" "}
                        <span className="font-bold text-foreground">{product?.name}</span>
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    {/* Current Category Display */}
                    <div className="p-3 bg-muted/30 border border-border/30 rounded-lg">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                            Current Category
                        </p>
                        <p className="text-sm font-medium">
                            {product?.category || "Not set"}
                        </p>
                    </div>

                    {/* Category Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="category">Select New Category</Label>
                        <Select
                            value={selectedCategoryId}
                            onValueChange={setSelectedCategoryId}
                        >
                            <SelectTrigger className="w-full h-11 rounded-xl border-border/50">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                                {flatCategories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>
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
                            Categories are shown in hierarchical order. Indented items are
                            subcategories.
                        </p>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                onOpenChange(false);
                                setSelectedCategoryId("");
                            }}
                            disabled={isLoading}
                            className="rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || !selectedCategoryId}
                            className="rounded-xl font-black"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Update Category"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
