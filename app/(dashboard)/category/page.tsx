'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { MoreHorizontal, Plus, ChevronRight, ChevronDown, Loader2, Edit, Trash2 } from 'lucide-react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface CategoryNode {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
    parentId?: string;
    children: CategoryNode[];
}

function buildCategoryTree(categories: any[]): CategoryNode[] {
    const map: { [key: string]: CategoryNode } = {};
    const tree: CategoryNode[] = [];

    categories.forEach(cat => {
        map[cat.id] = { ...cat, children: [] };
    });

    categories.forEach(cat => {
        if (cat.parentId && map[cat.parentId]) {
            map[cat.parentId].children.push(map[cat.id]);
        } else {
            tree.push(map[cat.id]);
        }
    });

    return tree;
}

function CategoryItem({ node, allCategories, onRefresh, depth = 0 }: { node: CategoryNode; allCategories: any[]; onRefresh: () => void; depth?: number }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [forceDelete, setForceDelete] = useState(false);
    const hasChildren = node.children.length > 0;

    const [deleteCategory, { loading: deleteLoading }] = useMutation(DELETE_CATEGORY, {
        onCompleted: () => {
            toast.success("Category deleted successfully");
            onRefresh();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete category");
        }
    });

    const handleDelete = async () => {
        await deleteCategory({
            variables: {
                id: node.id,
                force: hasChildren ? forceDelete : false
            }
        });
        setIsDeleteDialogOpen(false);
        setForceDelete(false);
    };

    return (
        <div className="space-y-2">
            <div
                className={clsx(
                    "flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors group",
                    depth > 0 && "ml-6 border-l border-muted pl-4"
                )}
            >
                <div className="flex items-center gap-2">
                    {hasChildren ? (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-1 rounded hover:bg-muted text-muted-foreground"
                        >
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                    ) : (
                        <div className="w-6" />
                    )}
                    <span className="font-medium">{node.name}</span>
                    <span className="text-xs text-muted-foreground">({node.slug})</span>
                    {!node.isActive && (
                        <span className="px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px] font-medium">
                            Inactive
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="p-1 rounded hover:bg-muted text-muted-foreground">
                                <MoreHorizontal className="h-4 w-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => {
                setIsDeleteDialogOpen(open);
                if (!open) setForceDelete(false);
            }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-4">
                            <div>
                                This will permanently delete the category <strong>{node.name}</strong>.
                            </div>

                            {hasChildren && (
                                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md space-y-3">
                                    <p className="text-sm text-destructive font-medium">
                                        Warning: This category has subcategories.
                                    </p>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="force-delete"
                                            checked={forceDelete}
                                            onCheckedChange={setForceDelete}
                                        />
                                        <Label htmlFor="force-delete" className="text-xs font-normal cursor-pointer text-foreground">
                                            Force delete recursively (delete all subcategories)
                                        </Label>
                                    </div>
                                </div>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setForceDelete(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            disabled={deleteLoading || (hasChildren && !forceDelete)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteLoading ? "Deleting..." : forceDelete ? "Force Delete All" : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <EditCategoryDialog
                open={isEditDialogOpen}
                setOpen={setIsEditDialogOpen}
                category={node}
                allCategories={allCategories}
                onRefresh={onRefresh}
            />

            {hasChildren && isExpanded && (
                <div className="space-y-1">
                    {node.children.map(child => (
                        <CategoryItem
                            key={child.id}
                            node={child}
                            allCategories={allCategories}
                            onRefresh={onRefresh}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function EditCategoryDialog({ open, setOpen, category, allCategories, onRefresh }: {
    open: boolean;
    setOpen: (open: boolean) => void;
    category: any;
    allCategories: any[];
    onRefresh: () => void;
}) {
    const [formData, setFormData] = useState({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        parentId: category.parentId || 'none',
        isActive: category.isActive
    });

    const [updateCategory, { loading }] = useMutation(UPDATE_CATEGORY, {
        onCompleted: () => {
            toast.success("Category updated successfully");
            setOpen(false);
            onRefresh();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update category");
        }
    });

    const flatCategories = flattenCategories(buildCategoryTree(allCategories))
        .filter(c => c.id !== category.id); // Prevent setting itself as parent

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const input = {
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
            parentId: formData.parentId === 'none' ? null : formData.parentId,
            isActive: formData.isActive
        };
        await updateCategory({ variables: { id: category.id, input } });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Category: {category.name}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-slug">Slug</Label>
                            <Input
                                id="edit-slug"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-parent">Parent Category</Label>
                        <Select
                            value={formData.parentId}
                            onValueChange={(val) => setFormData({ ...formData, parentId: val })}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select parent" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                                <SelectItem value="none">None (Root Category)</SelectItem>
                                {flatCategories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        <div className="flex items-center">
                                            {Array.from({ length: cat.depth }).map((_, i) => (
                                                <span key={i} className="inline-block w-4 border-l border-muted-foreground/30 h-4 ml-1 mr-1" />
                                            ))}
                                            {cat.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-description">Description</Label>
                        <Textarea
                            id="edit-description"
                            className="min-h-[100px] resize-none"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe what's in this category..."
                        />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="edit-active">Active Status</Label>
                            <p className="text-xs text-muted-foreground">
                                Inactive categories are hidden from the store.
                            </p>
                        </div>
                        <Switch
                            id="edit-active"
                            checked={formData.isActive}
                            onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function CategoryTree({ categories, onRefresh }: { categories: any[]; onRefresh: () => void }) {
    const tree = buildCategoryTree(categories);

    if (tree.length === 0) {
        return (
            <div className="text-center py-12 border rounded-lg bg-muted/20">
                <p className="text-muted-foreground">No categories found. Start by adding one!</p>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {tree.map(node => (
                <CategoryItem
                    key={node.id}
                    node={node}
                    allCategories={categories}
                    onRefresh={onRefresh}
                />
            ))}
        </div>
    );
}

function flattenCategories(categories: CategoryNode[], depth = 0): { id: string, name: string, depth: number }[] {
    let result: { id: string, name: string, depth: number }[] = [];
    categories.forEach(cat => {
        result.push({ id: cat.id, name: cat.name, depth });
        if (cat.children.length > 0) {
            result = result.concat(flattenCategories(cat.children, depth + 1));
        }
    });
    return result;
}

const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      id
      name
      slug
      isActive
      parentId
    }
  }
`;

const CREATE_CATEGORY_TREE = gql`
  mutation CreateCategoryTree($input: [CategoryTreeInput!]!) {
    createCategoryTree(input: $input) {
      id
      name
      slug
    }
  }
`;

const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: String!, $input: UpdateCategoryInput!) {
    updateCategory(id: $id, input: $input) {
      id
      name
      slug
      isActive
      parentId
    }
  }
`;

const DELETE_CATEGORY = gql`
    mutation DeleteCategory($id: String!, $force: Boolean) {
        deleteCategory(id: $id, force: $force)
    }
`;

function AddCategoryDialog({ categories, onRefresh }: { categories: any[], onRefresh: () => void }) {
    const [open, setOpen] = useState(false);
    const [rows, setRows] = useState<any[]>([
        { id: '1', name: '', slug: '', parentId: 'none', isActive: true, level: 0 }
    ]);

    const [createCategoryTree, { loading }] = useMutation(CREATE_CATEGORY_TREE, {
        onCompleted: () => {
            toast.success("Categories created successfully");
            setOpen(false);
            setRows([{ id: '1', name: '', slug: '', parentId: 'none', isActive: true, level: 0 }]);
            onRefresh();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to create categories");
        }
    });

    const flatCategories = flattenCategories(buildCategoryTree(categories));

    const addRow = () => {
        const newId = Math.random().toString(36).substr(2, 9);
        setRows([...rows, { id: newId, name: '', slug: '', parentId: 'none', isActive: true, level: 0 }]);
    };

    const addSubRow = (parentIndex: number) => {
        const parent = rows[parentIndex];
        const newId = Math.random().toString(36).substr(2, 9);
        const newRow = {
            id: newId,
            name: '',
            slug: '',
            parentId: parent.id,
            isActive: true,
            level: parent.level + 1
        };
        const newRows = [...rows];
        newRows.splice(parentIndex + 1, 0, newRow);
        setRows(newRows);
    };

    const removeRow = (index: number) => {
        if (rows.length === 1) return;
        const rowToRemove = rows[index];

        const getDescendants = (parentId: string): string[] => {
            const children = rows.filter(r => r.parentId === parentId);
            let descendants = children.map(c => c.id);
            children.forEach(c => {
                descendants = [...descendants, ...getDescendants(c.id)];
            });
            return descendants;
        };

        const descendantsToRemove = getDescendants(rowToRemove.id);
        const newRows = rows.filter((r, i) => i !== index && !descendantsToRemove.includes(r.id));
        setRows(newRows);
    };

    const updateRow = (index: number, field: string, value: any) => {
        const newRows = [...rows];
        newRows[index] = { ...newRows[index], [field]: value };
        if (field === 'name') {
            newRows[index].slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        }
        setRows(newRows);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate
        const invalidRow = rows.find(r => !r.name || !r.slug);
        if (invalidRow) {
            toast.error("All rows must have a name and slug");
            return;
        }

        // Build the tree input for the mutation
        // Since createCategoryTree takes a [CategoryTreeInput!]!, we need to build it correctly.
        // But our rows are partially linked within the session (new -> new) and partially to existing (new -> existing).

        const buildTree = (parentId: string | null): any[] => {
            return rows
                .filter(r => (r.parentId === 'none' && parentId === null) || (r.parentId === parentId))
                .map(r => ({
                    name: r.name,
                    slug: r.slug,
                    isActive: r.isActive,
                    parentId: r.parentId === 'none' ? null : (flatCategories.some(c => c.id === r.parentId) ? r.parentId : null),
                    children: buildTree(r.id)
                }));
        };

        const treeInput = buildTree(null);

        // Filter out cases where parentId was an existing category but it was assigned as children in the tree logic
        // The treeInput should only contain root level items (where parentId is null or an existing category)

        const finalInput = rows
            .filter(r => r.parentId === 'none' || flatCategories.some(c => c.id === r.parentId))
            .map(r => ({
                name: r.name,
                slug: r.slug,
                isActive: r.isActive,
                parentId: r.parentId === 'none' ? null : r.parentId,
                children: buildTree(r.id)
            }));

        await createCategoryTree({ variables: { input: finalInput } });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Add Category
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Add New Categories</DialogTitle>
                    <DialogDescription>
                        Add one or more categories. You can create nested structures directly in the table.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col gap-4 py-4">
                    <div className="flex-1 overflow-auto border rounded-md">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 sticky top-0 z-10">
                                <tr className="border-b">
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground w-[40px]">#</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Category Name</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Slug</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground min-w-[200px]">Parent</th>
                                    <th className="h-10 px-4 text-center font-medium text-muted-foreground w-[80px]">Active</th>
                                    <th className="h-10 px-4 text-right font-medium text-muted-foreground w-[120px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {rows.map((row, index) => (
                                    <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-2 text-muted-foreground text-xs">{index + 1}</td>
                                        <td className="px-4 py-2">
                                            <div className="flex items-center gap-2">
                                                {row.level > 0 && (
                                                    <div className="flex items-center opacity-50">
                                                        {Array.from({ length: row.level }).map((_, i) => (
                                                            <div key={i} className="w-4 h-4 border-l-2 border-b-2 rounded-bl-sm border-muted-foreground mr-1 translate-y-[-4px]" />
                                                        ))}
                                                    </div>
                                                )}
                                                <Input
                                                    value={row.name}
                                                    onChange={(e) => updateRow(index, 'name', e.target.value)}
                                                    placeholder="Category name"
                                                    className="h-8 shadow-sm focus-visible:ring-primary"
                                                />
                                            </div>
                                        </td>
                                        <td className="px-4 py-2">
                                            <Input
                                                value={row.slug}
                                                onChange={(e) => updateRow(index, 'slug', e.target.value)}
                                                placeholder="slug"
                                                className="h-8 font-mono text-xs bg-muted/20"
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            {row.level === 0 ? (
                                                <Select
                                                    value={row.parentId}
                                                    onValueChange={(v) => updateRow(index, 'parentId', v)}
                                                >
                                                    <SelectTrigger className="h-8 bg-background">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="max-h-[300px]">
                                                        <SelectItem value="none">Root Category</SelectItem>
                                                        {flatCategories.map(c => (
                                                            <SelectItem key={c.id} value={c.id}>
                                                                <div className="flex items-center">
                                                                    {Array.from({ length: c.depth }).map((_, i) => (
                                                                        <span key={i} className="inline-block w-3 border-l h-3 ml-1 mr-1 border-muted-foreground/30" />
                                                                    ))}
                                                                    {c.name}
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <div className="text-[10px] text-muted-foreground px-2 italic flex items-center gap-1">
                                                    <ChevronRight className="h-3 w-3" />
                                                    Sub-category of row {(rows.findIndex(r => r.id === row.parentId) + 1) || 'above'}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <Switch
                                                checked={row.isActive}
                                                onCheckedChange={(v) => updateRow(index, 'isActive', v)}
                                            />
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-primary"
                                                    title="Add Sub-category"
                                                    onClick={() => addSubRow(index)}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive"
                                                    title="Remove Row"
                                                    onClick={() => removeRow(index)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addRow}
                            className="flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" /> Add Row
                        </Button>
                        <DialogFooter className="gap-2">
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={loading} className="min-w-[120px]">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Categories
                            </Button>
                        </DialogFooter>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

const GET_CONTENT = gql`
  query GetContent {
    categories {
      id
      name
      slug
      isActive
      parentName
      parentId
    }
  }
`;

export default function ContentPage() {
    const { data, loading, error, refetch } = useQuery(GET_CONTENT);

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">Error: {error.message}</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Category Management</h1>
            </div>

            <div className="space-y-4">
                <div className="flex justify-end">
                    <AddCategoryDialog categories={data?.categories || []} onRefresh={() => refetch()} />
                </div>
                <div className="rounded-md border p-4">
                    <CategoryTree categories={data?.categories || []} onRefresh={() => refetch()} />
                </div>
            </div>
        </div>
    );
}
