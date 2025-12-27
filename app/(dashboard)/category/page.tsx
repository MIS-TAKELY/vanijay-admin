'use client';

import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { clsx } from 'clsx';
import { MoreHorizontal, Plus, ChevronRight, ChevronDown, Loader2, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
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
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Copy, ClipboardPaste } from 'lucide-react';


interface CategoryNode {
    id: string;
    name: string;
    slug: string;
    description?: string;
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

function CategoryItem({
    node,
    allCategories,
    onRefresh,
    depth = 0,
    selectedIds = [],
    onToggleSelection
}: {
    node: CategoryNode;
    allCategories: any[];
    onRefresh: () => void;
    depth?: number;
    selectedIds?: string[];
    onToggleSelection?: (id: string, selected: boolean) => void;
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [forceDelete, setForceDelete] = useState(false);
    const hasChildren = node.children.length > 0;

    const [deleteCategory, { loading: deleteLoading }] = useMutation(DELETE_CATEGORY, {
        update(cache, _, { variables }) {
            const existingData: any = cache.readQuery({ query: GET_CONTENT });
            if (existingData && existingData.categories) {
                cache.writeQuery({
                    query: GET_CONTENT,
                    data: {
                        categories: existingData.categories.filter((c: any) => c.id !== variables?.id)
                    }
                });
            }
        },
        onCompleted: () => {
            toast.success("Category deleted successfully");
            // onRefresh(); // Cache update handles this
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
                    {onToggleSelection && (
                        <Checkbox
                            checked={selectedIds.includes(node.id)}
                            onCheckedChange={(checked) => onToggleSelection(node.id, !!checked)}
                            className="mr-2"
                        />
                    )}
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
                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => setIsEditDialogOpen(true)}
                        title="Edit Category"
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setIsDeleteDialogOpen(true)}
                        title="Delete Category"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
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
                            selectedIds={selectedIds}
                            onToggleSelection={onToggleSelection}
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
            // onRefresh(); // Cache update might handle this or we rely on Apollo's automatic update for same ID
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update category");
        }
    });

    const flatCategories = useMemo(() =>
        flattenCategories(buildCategoryTree(allCategories))
            .filter(c => c.id !== category.id),
        [allCategories, category.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const input = {
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
            parentId: formData.parentId === 'none' ? null : formData.parentId,
            isActive: formData.isActive
        };
        const parentCategory = allCategories.find(c => c.id === formData.parentId);
        await updateCategory({
            variables: { id: category.id, input },
            optimisticResponse: {
                updateCategory: {
                    __typename: "Category",
                    id: category.id,
                    name: formData.name,
                    slug: formData.slug,
                    isActive: formData.isActive,
                    parentId: formData.parentId === 'none' ? null : formData.parentId,
                    parentName: parentCategory ? parentCategory.name : null,
                    description: formData.description
                }
            }
        });
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
      isActive
      parentId
      parentName
      description
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
      parentName
      description
    }
  }
`;

const DELETE_CATEGORY = gql`
    mutation DeleteCategory($id: String!, $force: Boolean) {
        deleteCategory(id: $id, force: $force)
    }
`;

const BULK_UPDATE_CATEGORIES = gql`
  mutation BulkUpdateCategories($input: [BulkUpdateCategoryInput!]!) {
    bulkUpdateCategories(input: $input) {
      id
      name
      slug
      isActive
      parentId
      parentName
      description
    }
  }
`;

function BulkEditDialog({ open, setOpen, categories, allCategories, onRefresh, onClearSelection, onToggleSelection }: {
    open: boolean;
    setOpen: (open: boolean) => void;
    categories: any[];
    allCategories: any[];
    onRefresh: () => void;
    onClearSelection: () => void;
    onToggleSelection: (id: string, selected: boolean) => void;
}) {
    const [rows, setRows] = useState<any[]>([]);
    const [collapsedIds, setCollapsedIds] = useState<string[]>([]);
    const [filterActiveOnly, setFilterActiveOnly] = useState(false);

    // Memoize calculations
    const flatCategories = useMemo(() =>
        flattenCategories(buildCategoryTree(allCategories)),
        [allCategories]);

    const rowMapByParent = useMemo(() => {
        const map = new Map<string, any[]>();
        rows.forEach(r => {
            const pid = r.parentId || 'none';
            if (!map.has(pid)) map.set(pid, []);
            map.get(pid)!.push(r);
        });
        return map;
    }, [rows]);

    const hiddenIds = useMemo(() => {
        const hidden = new Set<string>();
        const rowMap = new Map(rows.map(r => [r.id, r]));

        rows.forEach(row => {
            if (filterActiveOnly && !row.isActive) {
                hidden.add(row.id);
                return;
            }

            let curr = row;
            let checkPid = curr.parentId;
            while (checkPid && checkPid !== 'none') {
                if (collapsedIds.includes(checkPid)) {
                    hidden.add(row.id);
                    break;
                }
                const parent = rowMap.get(checkPid);
                if (!parent) break;
                checkPid = parent.parentId;
            }
        });
        return hidden;
    }, [rows, filterActiveOnly, collapsedIds]);

    // Initialize rows when dialog opens or selected categories change
    useEffect(() => {
        if (open) {
            setRows(categories.map(c => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                description: c.description || '',
                parentId: c.parentId || 'none',
                isActive: c.isActive,
                depth: c.depth
            })));
        }
    }, [open, categories]);

    const toggleAllActive = useCallback((active: boolean) => {
        setRows(prev => prev.map(r => ({ ...r, isActive: active })));
    }, []);

    const toggleBranchActive = useCallback((id: string, active: boolean) => {
        setRows(prev => {
            const newRows = [...prev];
            const updateDescendants = (pid: string) => {
                newRows.forEach((r, i) => {
                    if (r.parentId === pid) {
                        newRows[i] = { ...newRows[i], isActive: active };
                        updateDescendants(r.id);
                    }
                });
            };
            const idx = newRows.findIndex(r => r.id === id);
            if (idx !== -1) {
                newRows[idx] = { ...newRows[idx], isActive: active };
                updateDescendants(id);
            }
            return newRows;
        });
    }, []);

    const toggleCollapse = useCallback((id: string) => {
        setCollapsedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    }, []);

    const [createCategoryTree, { loading: createLoading }] = useMutation(CREATE_CATEGORY_TREE, {
        update(cache, { data }) {
            if (data?.createCategoryTree) {
                const existingData: any = cache.readQuery({ query: GET_CONTENT });
                if (existingData && existingData.categories) {
                    cache.writeQuery({
                        query: GET_CONTENT,
                        data: {
                            categories: [...existingData.categories, ...data.createCategoryTree]
                        }
                    });
                }
            }
        }
    });

    const [bulkUpdateCategories, { loading: updateLoading }] = useMutation(BULK_UPDATE_CATEGORIES, {
        update(cache, { data }) {
            if (data?.bulkUpdateCategories) {
                const existingData: any = cache.readQuery({ query: GET_CONTENT });
                if (existingData && existingData.categories) {
                    const updatedMap = new Map(data.bulkUpdateCategories.map((c: any) => [c.id, c]));
                    const newCategories = existingData.categories.map((c: any) => {
                        const updated = updatedMap.get(c.id);
                        return updated ? { ...c, ...updated, __typename: 'Category' } : c;
                    });
                    cache.writeQuery({
                        query: GET_CONTENT,
                        data: { categories: newCategories }
                    });
                }
            }
        },
        onCompleted: async () => {
            const newRows = rows.filter(r => r.isNew);
            if (newRows.length > 0) {
                const buildTree = (parentId: string | null): any[] => {
                    return newRows
                        .filter(r => r.parentId === parentId)
                        .map(r => ({
                            name: r.name,
                            slug: r.slug,
                            isActive: r.isActive,
                            parentId: allCategories.some(c => c.id === r.parentId) ? r.parentId : null,
                            children: buildTree(r.id)
                        }));
                };

                const rootNewRows = newRows.filter(r => r.parentId === 'none' || allCategories.some(c => c.id === r.parentId));
                const treeInput = rootNewRows.map(r => ({
                    name: r.name,
                    slug: r.slug,
                    isActive: r.isActive,
                    parentId: r.parentId === 'none' ? null : r.parentId,
                    children: buildTree(r.id)
                }));

                try {
                    await createCategoryTree({ variables: { input: treeInput } });
                    toast.success("Categories updated and created successfully");
                } catch (e: any) {
                    toast.error("Updates saved, but failed to create new categories: " + e.message);
                }
            } else {
                toast.success("Categories updated successfully");
            }
            setOpen(false);
            onClearSelection();
            // onRefresh(); // Cache update handles this
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update categories");
        }
    });

    const loading = updateLoading || createLoading;

    const addSubRow = useCallback((parentId: string, depth: number) => {
        setRows(prev => {
            const newId = Math.random().toString(36).substr(2, 9);
            const parentIndex = prev.findIndex(r => r.id === parentId);
            const newRow = {
                id: newId,
                name: '',
                slug: '',
                description: '',
                parentId: parentId,
                isActive: true,
                depth: depth + 1,
                isNew: true
            };
            const newRows = [...prev];
            newRows.splice(parentIndex + 1, 0, newRow);
            return newRows;
        });
    }, []);

    const handleSubPaste = useCallback((parentId: string, depth: number, text: string) => {
        const names = text.split('\n').map(n => n.trim()).filter(Boolean);
        setRows(prev => {
            const parentIndex = prev.findIndex(r => r.id === parentId);
            const insertedRows = names.map(name => ({
                id: Math.random().toString(36).substr(2, 9),
                name,
                slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                description: '',
                parentId: parentId,
                isActive: true,
                depth: depth + 1,
                isNew: true
            }));
            const newRows = [...prev];
            newRows.splice(parentIndex + 1, 0, ...insertedRows);
            return newRows;
        });
    }, []);

    const removeRow = useCallback((id: string, isNew: boolean) => {
        if (!isNew) {
            onToggleSelection(id, false);
        }
        setRows(prev => prev.filter(r => r.id !== id));
    }, [onToggleSelection]);

    const updateRow = useCallback((id: string, field: string, value: any) => {
        setRows(prev => prev.map(r => {
            if (r.id !== id) return r;
            const updated = { ...r, [field]: value };
            if (field === 'name' && value) {
                updated.slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            }
            return updated;
        }));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const toUpdate = rows.filter(r => !r.isNew).map(r => ({
            id: r.id,
            name: r.name,
            slug: r.slug,
            description: r.description,
            parentId: r.parentId,
            isActive: r.isActive
        }));

        if (toUpdate.length > 0) {
            await bulkUpdateCategories({
                variables: { input: toUpdate },
                optimisticResponse: {
                    bulkUpdateCategories: toUpdate.map(cat => ({
                        __typename: "Category",
                        ...cat,
                        parentId: cat.parentId === 'none' ? null : cat.parentId,
                        parentName: allCategories.find(c => c.id === cat.parentId)?.name || null,
                        description: cat.description || null
                    }))
                }
            });
        } else {
            // If only creates, we need to trigger the same logic as onCompleted of update
            // (Alternatively, just move the logic to a separate function)
            const newRows = rows.filter(r => r.isNew);
            const buildTree = (parentId: string | null): any[] => {
                return newRows
                    .filter(r => r.parentId === parentId)
                    .map(r => ({
                        name: r.name,
                        slug: r.slug,
                        isActive: r.isActive,
                        parentId: allCategories.some(c => c.id === r.parentId) ? r.parentId : null,
                        children: buildTree(r.id)
                    }));
            };
            const rootNewRows = newRows.filter(r => r.parentId === 'none' || allCategories.some(c => c.id === r.parentId));
            const treeInput = rootNewRows.map(r => ({
                name: r.name,
                slug: r.slug,
                isActive: r.isActive,
                parentId: r.parentId === 'none' ? null : r.parentId,
                children: buildTree(r.id)
            }));
            await createCategoryTree({ variables: { input: treeInput } });
            toast.success("Categories created successfully");
            setOpen(false);
            onClearSelection();
            // onRefresh();
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle>Bulk Edit Categories ({categories.length})</DialogTitle>
                        <div className="flex items-center gap-2 mr-6">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 gap-2"
                                onClick={() => setFilterActiveOnly(!filterActiveOnly)}
                            >
                                {filterActiveOnly ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                {filterActiveOnly ? "Show All" : "Hide Inactive"}
                            </Button>
                            <div className="flex border rounded-md overflow-hidden">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 rounded-none border-r bg-green-500/10 hover:bg-green-500/20 text-green-600 px-3"
                                    onClick={() => toggleAllActive(true)}
                                >
                                    Activate All
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 rounded-none bg-red-500/10 hover:bg-red-500/20 text-red-600 px-3"
                                    onClick={() => toggleAllActive(false)}
                                >
                                    Deactivate All
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col gap-4 py-4">
                    <div className="flex-1 overflow-auto border rounded-md">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 sticky top-0 z-10">
                                <tr className="border-b">
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Name</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Slug</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground min-w-[200px]">Parent</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Description</th>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground w-[120px]">
                                        <div className="flex items-center gap-2">
                                            Active
                                            <Switch
                                                className="scale-75"
                                                checked={rows.every(r => r.isActive)}
                                                onCheckedChange={(v) => toggleAllActive(v)}
                                            />
                                        </div>
                                    </th>
                                    <th className="h-10 px-4 text-right font-medium text-muted-foreground w-[120px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {rows.map((row) => {
                                    if (hiddenIds.has(row.id)) return null;
                                    const hasChildrenInEdit = rowMapByParent.has(row.id);
                                    const isCollapsed = collapsedIds.includes(row.id);

                                    return (
                                        <BulkEditRow
                                            key={row.id}
                                            row={row}
                                            hasChildrenInEdit={hasChildrenInEdit}
                                            isCollapsed={isCollapsed}
                                            flatCategories={flatCategories}
                                            onUpdate={updateRow}
                                            onToggleCollapse={toggleCollapse}
                                            onToggleBranchActive={toggleBranchActive}
                                            onAddSubRow={addSubRow}
                                            onHandleSubPaste={handleSubPaste}
                                            onRemoveRow={removeRow}
                                        />
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update All
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

const BulkEditRow = memo(({
    row,
    hasChildrenInEdit,
    isCollapsed,
    flatCategories,
    onUpdate,
    onToggleCollapse,
    onToggleBranchActive,
    onAddSubRow,
    onHandleSubPaste,
    onRemoveRow
}: {
    row: any;
    hasChildrenInEdit: boolean;
    isCollapsed: boolean;
    flatCategories: any[];
    onUpdate: (id: string, field: string, value: any) => void;
    onToggleCollapse: (id: string) => void;
    onToggleBranchActive: (id: string, active: boolean) => void;
    onAddSubRow: (id: string, depth: number) => void;
    onHandleSubPaste: (id: string, depth: number, text: string) => void;
    onRemoveRow: (id: string, isNew: boolean) => void;
}) => {
    return (
        <tr className="hover:bg-muted/30">
            <td className="px-4 py-2">
                <div className="flex items-center gap-1">
                    {row.depth > 0 && (
                        <div className="flex items-center opacity-30">
                            {Array.from({ length: row.depth }).map((_, i) => (
                                <div key={i} className="w-3 h-4 border-l-2 border-b-2 rounded-bl-sm border-muted-foreground mr-0.5 translate-y-[-4px]" />
                            ))}
                        </div>
                    )}
                    {hasChildrenInEdit && (
                        <button
                            type="button"
                            onClick={() => onToggleCollapse(row.id)}
                            className="p-1 hover:bg-muted rounded text-muted-foreground"
                        >
                            {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </button>
                    )}
                    {!hasChildrenInEdit && row.depth > 0 && <div className="w-5" />}
                    <Input
                        value={row.name}
                        onChange={(e) => onUpdate(row.id, 'name', e.target.value)}
                        className="h-8"
                    />
                </div>
            </td>
            <td className="px-4 py-2">
                <Input
                    value={row.slug}
                    onChange={(e) => onUpdate(row.id, 'slug', e.target.value)}
                    className="h-8 font-mono text-xs"
                />
            </td>
            <td className="px-4 py-2">
                <Select
                    value={row.parentId}
                    onValueChange={(v) => onUpdate(row.id, 'parentId', v)}
                >
                    <SelectTrigger className="h-8">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                        <SelectItem value="none">Root Category</SelectItem>
                        {flatCategories.filter(c => c.id !== row.id).map(c => (
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
            </td>
            <td className="px-4 py-2">
                <Input
                    value={row.description}
                    onChange={(e) => onUpdate(row.id, 'description', e.target.value)}
                    className="h-8"
                    placeholder="Description..."
                />
            </td>
            <td className="px-4 py-2 text-center">
                <Switch
                    checked={row.isActive}
                    onCheckedChange={(v) => onUpdate(row.id, 'isActive', v)}
                />
            </td>
            <td className="px-4 py-2 text-right">
                <div className="flex justify-end gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={clsx(
                            "h-8 w-8",
                            row.isActive ? "text-blue-500" : "text-muted-foreground opacity-50"
                        )}
                        title={row.isActive ? "Deactivate Branch" : "Activate Branch"}
                        onClick={() => onToggleBranchActive(row.id, !row.isActive)}
                    >
                        {row.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue-500"
                                title="Paste Sub-categories"
                            >
                                <ClipboardPaste className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm">Paste Sub-categories</h4>
                                <p className="text-xs text-muted-foreground">One name per line. They will be added as sub-categories of this row.</p>
                                <Textarea
                                    placeholder="Sub-cat 1&#10;Sub-cat 2..."
                                    className="min-h-[100px] text-xs"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.ctrlKey) {
                                            onHandleSubPaste(row.id, row.depth, e.currentTarget.value);
                                            e.currentTarget.value = '';
                                        }
                                    }}
                                />
                                <Button
                                    type="button"
                                    size="sm"
                                    className="w-full"
                                    onClick={(e) => {
                                        const textarea = (e.currentTarget.previousElementSibling as HTMLTextAreaElement);
                                        onHandleSubPaste(row.id, row.depth, textarea.value);
                                        textarea.value = '';
                                    }}
                                >
                                    Add Sub-categories
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary"
                        title="Add Sub-category"
                        onClick={() => onAddSubRow(row.id, row.depth)}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        title="Remove from Edit"
                        onClick={() => onRemoveRow(row.id, !!row.isNew)}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </td>
        </tr>
    );
});
BulkEditRow.displayName = 'BulkEditRow';


function CategoryTree({ categories, onRefresh, selectedIds, onToggleSelection }: {
    categories: any[];
    onRefresh: () => void;
    selectedIds?: string[];
    onToggleSelection?: (id: string, selected: boolean) => void;
}) {
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
                    selectedIds={selectedIds}
                    onToggleSelection={onToggleSelection}
                />
            ))}
        </div>
    );
}

function AddCategoryDialog({ categories, onRefresh }: { categories: any[], onRefresh: () => void }) {
    const [open, setOpen] = useState(false);
    const [rows, setRows] = useState<any[]>([
        { id: '1', name: '', slug: '', parentId: 'none', isActive: true, level: 0 }
    ]);
    const [pasteValue, setPasteValue] = useState('');
    const [isPasteOpen, setIsPasteOpen] = useState(false);

    const [createCategoryTree, { loading }] = useMutation(CREATE_CATEGORY_TREE, {
        update(cache, { data }) {
            if (data?.createCategoryTree) {
                const existingData: any = cache.readQuery({ query: GET_CONTENT });
                if (existingData && existingData.categories) {
                    cache.writeQuery({
                        query: GET_CONTENT,
                        data: {
                            categories: [...existingData.categories, ...data.createCategoryTree]
                        }
                    });
                }
            }
        },
        onCompleted: () => {
            toast.success("Categories created successfully");
            setOpen(false);
            setRows([{ id: '1', name: '', slug: '', parentId: 'none', isActive: true, level: 0 }]);
            // onRefresh();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to create categories");
        }
    });



    const flatCategories = useMemo(() =>
        flattenCategories(buildCategoryTree(categories)),
        [categories]);

    const addRow = useCallback(() => {
        const newId = Math.random().toString(36).substr(2, 9);
        setRows(prev => [...prev, { id: newId, name: '', slug: '', parentId: 'none', isActive: true, level: 0 }]);
    }, []);

    const addSubRow = useCallback((parentIndex: number) => {
        setRows(prev => {
            const parent = prev[parentIndex];
            const newId = Math.random().toString(36).substr(2, 9);
            const newRow = {
                id: newId,
                name: '',
                slug: '',
                parentId: parent.id,
                isActive: true,
                level: parent.level + 1
            };
            const newRows = [...prev];
            newRows.splice(parentIndex + 1, 0, newRow);
            return newRows;
        });
    }, []);

    const removeRow = useCallback((index: number) => {
        setRows(prev => {
            if (prev.length === 1) return prev;
            const rowToRemove = prev[index];

            const getDescendants = (parentId: string): string[] => {
                const children = prev.filter(r => r.parentId === parentId);
                let descendants = children.map(c => c.id);
                children.forEach(c => {
                    descendants = [...descendants, ...getDescendants(c.id)];
                });
                return descendants;
            };

            const descendantsToRemove = getDescendants(rowToRemove.id);
            const newRows = prev.filter((r, i) => i !== index && !descendantsToRemove.includes(r.id));
            return newRows;
        });
    }, []);

    const updateRow = useCallback((index: number, field: string, value: any) => {
        setRows(prev => prev.map((r, i) => {
            if (i !== index) return r;
            const updated = { ...r, [field]: value };
            if (field === 'name' && value) {
                updated.slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            }
            return updated;
        }));
    }, []);

    const handlePaste = () => {
        if (!pasteValue.trim()) return;

        const names = pasteValue.split('\n').map(n => n.trim()).filter(Boolean);
        const newRows = [...rows];

        // Find last empty row or use it if it exists
        const lastRow = newRows[newRows.length - 1];
        let startIndex = newRows.length;
        if (lastRow && !lastRow.name) {
            startIndex = newRows.length - 1;
        }

        names.forEach((name, i) => {
            const id = Math.random().toString(36).substr(2, 9);
            const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const row = {
                id,
                name,
                slug,
                parentId: 'none',
                isActive: true,
                level: 0
            };
            if (startIndex + i < newRows.length) {
                newRows[startIndex + i] = row;
            } else {
                newRows.push(row);
            }
        });

        setRows(newRows);
        setPasteValue('');
        setIsPasteOpen(false);
        toast.success(`Added ${names.length} categories`);
    };

    const handleSubPaste = (parentIndex: number, text: string) => {
        const names = text.split('\n').map(n => n.trim()).filter(Boolean);
        const parent = rows[parentIndex];
        const insertedRows: any[] = [];

        names.forEach((name) => {
            const id = Math.random().toString(36).substr(2, 9);
            const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            insertedRows.push({
                id,
                name,
                slug,
                parentId: parent.id,
                isActive: true,
                level: parent.level + 1
            });
        });

        const newRows = [...rows];
        newRows.splice(parentIndex + 1, 0, ...insertedRows);
        setRows(newRows);
        toast.success(`Added ${names.length} sub-categories`);
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
                                    <AddCategoryRow
                                        key={row.id}
                                        row={row}
                                        index={index}
                                        rows={rows}
                                        flatCategories={flatCategories}
                                        onUpdate={updateRow}
                                        onAddSubRow={addSubRow}
                                        onHandleSubPaste={handleSubPaste}
                                        onRemoveRow={removeRow}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addRow}
                                className="flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" /> Add Row
                            </Button>

                            <Popover open={isPasteOpen} onOpenChange={setIsPasteOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-2"
                                    >
                                        <ClipboardPaste className="h-4 w-4" /> Paste Multiple
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm">Paste Category Names</h4>
                                        <p className="text-xs text-muted-foreground">Enter names separated by new lines.</p>
                                        <Textarea
                                            value={pasteValue}
                                            onChange={(e) => setPasteValue(e.target.value)}
                                            placeholder="Electronics&#10;Fashion&#10;Home Decor"
                                            className="min-h-[120px]"
                                        />
                                        <Button
                                            type="button"
                                            className="w-full"
                                            onClick={handlePaste}
                                            disabled={!pasteValue.trim()}
                                        >
                                            Apply
                                        </Button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
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

const AddCategoryRow = memo(({
    row,
    index,
    rows,
    flatCategories,
    onUpdate,
    onAddSubRow,
    onHandleSubPaste,
    onRemoveRow
}: {
    row: any;
    index: number;
    rows: any[];
    flatCategories: any[];
    onUpdate: (index: number, field: string, value: any) => void;
    onAddSubRow: (index: number) => void;
    onHandleSubPaste: (index: number, text: string) => void;
    onRemoveRow: (index: number) => void;
}) => {
    return (
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
                        onChange={(e) => onUpdate(index, 'name', e.target.value)}
                        placeholder="Category name"
                        className="h-8 shadow-sm focus-visible:ring-primary"
                    />
                </div>
            </td>
            <td className="px-4 py-2">
                <Input
                    value={row.slug}
                    onChange={(e) => onUpdate(index, 'slug', e.target.value)}
                    placeholder="slug"
                    className="h-8 font-mono text-xs bg-muted/20"
                />
            </td>
            <td className="px-4 py-2">
                {row.level === 0 ? (
                    <Select
                        value={row.parentId}
                        onValueChange={(v) => onUpdate(index, 'parentId', v)}
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
                    onCheckedChange={(v) => onUpdate(index, 'isActive', v)}
                />
            </td>
            <td className="px-4 py-2 text-right">
                <div className="flex justify-end gap-1">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue-500"
                                title="Paste Sub-categories"
                            >
                                <ClipboardPaste className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm">Paste Sub-categories</h4>
                                <p className="text-xs text-muted-foreground">One name per line. They will be added as sub-categories of this row.</p>
                                <Textarea
                                    placeholder="Sub-cat 1&#10;Sub-cat 2..."
                                    className="min-h-[100px] text-xs"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.ctrlKey) {
                                            onHandleSubPaste(index, e.currentTarget.value);
                                            e.currentTarget.value = '';
                                        }
                                    }}
                                />
                                <Button
                                    type="button"
                                    size="sm"
                                    className="w-full"
                                    onClick={(e) => {
                                        const textarea = (e.currentTarget.previousElementSibling as HTMLTextAreaElement);
                                        onHandleSubPaste(index, textarea.value);
                                        textarea.value = '';
                                    }}
                                >
                                    Add Sub-categories
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary"
                        title="Add Sub-category"
                        onClick={() => onAddSubRow(index)}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        title="Remove Row"
                        onClick={() => onRemoveRow(index)}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </td>
        </tr>
    );
});
AddCategoryRow.displayName = 'AddCategoryRow';


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
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBulkEditDialogOpen, setIsBulkEditDialogOpen] = useState(false);
    const [showInactive, setShowInactive] = useState(true);

    const [bulkUpdateCategories] = useMutation(BULK_UPDATE_CATEGORIES, {
        onCompleted: () => {
            toast.success("Categories updated successfully");
            refetch();
        },
        onError: (e) => toast.error(e.message)
    });

    const handleBulkVisibility = async (active: boolean) => {
        const input = selectedIds.map(id => {
            const cat = data?.categories.find((c: any) => c.id === id);
            return {
                id,
                name: cat.name,
                slug: cat.slug,
                isActive: active
            };
        });
        await bulkUpdateCategories({ variables: { input } });
    };

    const toggleSelection = (id: string, selected: boolean) => {
        const getDescendants = (pid: string): string[] => {
            const children = (data?.categories || []).filter((c: any) => c.parentId === pid);
            let ids = children.map((c: any) => c.id);
            children.forEach((c: any) => {
                ids = [...ids, ...getDescendants(c.id)];
            });
            return ids;
        };

        const idsToToggle = [id, ...getDescendants(id)];

        setSelectedIds(prev => {
            if (selected) {
                return [...new Set([...prev, ...idsToToggle])];
            } else {
                return prev.filter(i => !idsToToggle.includes(i));
            }
        });
    };

    const allFlatCategories = flattenCategories(buildCategoryTree(data?.categories || []));
    const selectedCategories = allFlatCategories
        .filter(c => selectedIds.includes(c.id))
        .map(c => {
            const fullCat = data.categories.find((cat: any) => cat.id === c.id);
            return { ...fullCat, depth: c.depth };
        });

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">Error: {error.message}</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Category Management</h1>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center bg-muted/30 p-2 rounded-lg">
                    <div className="flex items-center gap-2">
                        {selectedIds.length > 0 && (
                            <>
                                <span className="text-sm font-medium">{selectedIds.length} categories selected</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsBulkEditDialogOpen(true)}
                                    className="flex items-center gap-2"
                                >
                                    <Edit className="h-3.5 w-3.5" /> Bulk Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleBulkVisibility(true)}
                                    className="flex items-center gap-2 text-green-600 hover:text-green-700"
                                >
                                    <Eye className="h-3.5 w-3.5" /> Show Selected
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleBulkVisibility(false)}
                                    className="flex items-center gap-2 text-red-600 hover:text-red-700"
                                >
                                    <EyeOff className="h-3.5 w-3.5" /> Hide Selected
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedIds([])}
                                    className="text-xs"
                                >
                                    Clear
                                </Button>
                            </>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <AddCategoryDialog categories={data?.categories || []} onRefresh={() => refetch()} />
                    </div>
                </div>

                <BulkEditDialog
                    open={isBulkEditDialogOpen}
                    setOpen={setIsBulkEditDialogOpen}
                    categories={selectedCategories}
                    allCategories={data?.categories || []}
                    onRefresh={() => refetch()}
                    onClearSelection={() => setSelectedIds([])}
                    onToggleSelection={toggleSelection}
                />

                <div className="rounded-md border p-4">
                    <div className="flex justify-end mb-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2 text-muted-foreground"
                            onClick={() => setShowInactive(!showInactive)}
                        >
                            {showInactive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            {showInactive ? "Viewing All Categories" : "Showing Active Only"}
                        </Button>
                    </div>
                    <CategoryTree
                        categories={(data?.categories || []).filter((c: any) => showInactive || c.isActive)}
                        onRefresh={() => refetch()}
                        selectedIds={selectedIds}
                        onToggleSelection={toggleSelection}
                    />
                </div>
            </div>
        </div>
    );
}
