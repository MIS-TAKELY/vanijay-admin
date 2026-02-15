"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useMutation, gql } from "@apollo/client";
import { transformProductToFormData } from "@/utils/product/transformProductData";
import { buildProductInput } from "@/utils/product/validateSteps";
import { Loader2, Plus, Trash2, GripVertical, Clipboard } from "lucide-react";
import { parseTableFromClipboard } from "@/utils/product/table-parser";
import { useCallback } from "react";

const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: String!, $input: UpdateProductInput!) {
    updateProduct(id: $id, input: $input) {
      id
      specificationTable
    }
  }
`;

interface EditSpecificationsDialogProps {
    product: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

interface SpecTable {
    headers: string[];
    rows: string[][];
}

export default function EditSpecificationsDialog({ product, open, onOpenChange, onSuccess }: EditSpecificationsDialogProps) {
    const [specTable, setSpecTable] = useState<SpecTable>({ headers: ["Feature", "Value"], rows: [["", ""]] });

    const [updateProduct, { loading: isUpdating }] = useMutation(UPDATE_PRODUCT, {
        onCompleted: () => {
            toast.success("Specifications updated successfully");
            onOpenChange(false);
            onSuccess?.();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update specifications");
        },
    });

    useEffect(() => {
        if (open && product) {
            try {
                const parsed = typeof product.specificationTable === 'string'
                    ? JSON.parse(product.specificationTable)
                    : product.specificationTable;

                if (parsed && Array.isArray(parsed.headers) && Array.isArray(parsed.rows) && parsed.rows.filter((r: any) => r.some((c: any) => c.trim())).length > 0) {
                    setSpecTable(parsed);
                } else {
                    // Fallback to variants
                    const defaultVar = product.variants?.find((v: any) => v.isDefault) || product.variants?.[0];
                    if (defaultVar?.specifications?.length) {
                        setSpecTable({
                            headers: ["Attribute", "Value"],
                            rows: defaultVar.specifications.map((s: any) => [s.key, s.value])
                        });
                    } else {
                        // Default if empty or invalid
                        setSpecTable({ headers: ["Feature", "Value"], rows: [["", ""]] });
                    }
                }
            } catch (e) {
                setSpecTable({ headers: ["Feature", "Value"], rows: [["", ""]] });
            }
        }
    }, [open, product]);

    const handleHeaderChange = (index: number, value: string) => {
        const newHeaders = [...specTable.headers];
        newHeaders[index] = value;
        setSpecTable(prev => ({ ...prev, headers: newHeaders }));
    };

    const handleCellChange = (rowIndex: number, cellIndex: number, value: string) => {
        const newRows = [...specTable.rows];
        newRows[rowIndex] = [...newRows[rowIndex]];
        newRows[rowIndex][cellIndex] = value;
        setSpecTable(prev => ({ ...prev, rows: newRows }));
    };

    const addRow = () => {
        const newRow = new Array(specTable.headers.length).fill("");
        setSpecTable(prev => ({ ...prev, rows: [...prev.rows, newRow] }));
    };

    const removeRow = (index: number) => {
        setSpecTable(prev => ({ ...prev, rows: prev.rows.filter((_, i) => i !== index) }));
    };

    const addColumn = () => {
        setSpecTable(prev => ({
            headers: [...prev.headers, "New Column"],
            rows: prev.rows.map(row => [...row, ""])
        }));
    };

    const removeColumn = (index: number) => {
        if (specTable.headers.length <= 1) {
            toast.error("Cannot remove all columns");
            return;
        }
        setSpecTable(prev => ({
            headers: prev.headers.filter((_, i) => i !== index),
            rows: prev.rows.map(row => row.filter((_, i) => i !== index))
        }));
    };

    const handlePaste = useCallback(
        (e: React.ClipboardEvent) => {
            const parsed = parseTableFromClipboard(e.clipboardData);
            if (parsed) {
                e.preventDefault();
                e.stopPropagation();

                // Intelligent Paste: If column counts match and we have data, append!
                const hasActualData = specTable.rows.some(row => row.some(cell => cell.trim()));

                if (hasActualData && specTable.headers.length === parsed.headers.length) {
                    // Remove empty placeholder rows from the end/start if they exist
                    const cleanExistingRows = specTable.rows.filter(row => row.some(cell => cell.trim()));
                    setSpecTable({
                        ...specTable,
                        rows: [...cleanExistingRows, ...parsed.rows]
                    });
                } else {
                    // Otherwise replace (usually for the first paste or when column structure changes)
                    setSpecTable(parsed);
                }
                toast.success("Table data pasted successfully");
            }
        },
        [specTable]
    );

    const handleSave = async () => {
        try {
            // 1. Get full form data from product
            const fullFormData = transformProductToFormData(product);

            // 2. Update with new values
            // Note: buildProductInput expects specificationTable to be in formData
            // But transformProductToFormData might not put it in the top level if it focuses on variants?
            // Let's check transformProductToFormData again.
            // It puts it in `specificationTable` property? No, looking at checking `transformProductToFormData.ts`
            // It returns an object that HAS `specificationTable` property?
            // Let's check the return type of transformProductToFormData.
            // It returns `FormData` which has `specificationTable` (if added to type definition).
            // `buildProductInput` uses `formData.specificationTable`.

            // I need to ensure `specificationTable` is passed correctly.
            // Since `fullFormData` is typed as `FormData`, I should cast or ensure it has it.
            // `transformProductToFormData` doesn't seem to explicitly setting `specificationTable` in the return object in the file I read earlier?
            // Wait, let's check `transformProductToFormData.ts` content again (Step 36).
            // Line 110: `status: ...`
            // It does NOT seem to return `specificationTable` at the top level! 
            // It returns `specifications` (array of objects) but `specificationTable` (JSON) is separate.
            // `buildProductInput` maps `formData.specificationTable` to `apiInput.specificationTable`.

            // BUT `EditProductClient` initializes `initialValues` with `transformProductToFormData(product)`.
            // And `ProductForm` uses it.
            // If `transformProductToFormData` doesn't return `specificationTable`, then `initialValues` won't have it.
            // let's re-read `transformProductToFormData.ts` (Step 36).

            // Line 20-30: maps images.
            // Line 104: return statement.
            // It does NOT have `specificationTable`!

            // Wait, `EditProductClient.tsx` (Step 22) line 35: `const initialValues = transformProductToFormData(product);`
            // And line 48: `specificationTable: input.specificationTable ? ...`
            // So `ProductForm` must be adding it or `transformProductToFormData` is missing it?
            // Or `ProductForm` manages it separately?

            // Actually `AdminProductDetail` shows `product.specificationTable`.
            // My update logic needs to be careful.

            // I will manually inject `specificationTable` into the input object for `updateProduct`.
            // `buildProductInput` creates `ICreateProductInput`.
            // I will modify the result of `buildProductInput` to include my new `specificationTable`.

            let input = buildProductInput(fullFormData);

            // Override the specificationTable with my state
            input = {
                ...input,
                specificationTable: JSON.stringify(specTable)
            };

            // 4. Call Mutation
            await updateProduct({
                variables: {
                    id: product.id,
                    input: input
                }
            });

        } catch (error) {
            console.error("Error saving specifications:", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Specifications</DialogTitle>
                    <DialogDescription>
                        Modify technical specifications. Add rows for more details.
                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground italic bg-muted/30 p-2 rounded-md">
                            <Clipboard className="h-3 w-3" />
                            Tip: You can paste (Ctrl+V) a table from Excel, Google Sheets, or web pages directly into the table below.
                        </div>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div
                        className="border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 outline-none"
                        onPaste={handlePaste}
                        tabIndex={0}
                    >
                        <div className="grid bg-muted/50 border-b" style={{ gridTemplateColumns: `repeat(${specTable.headers.length}, 1fr) 40px` }}>
                            {specTable.headers.map((header, i) => (
                                <div key={i} className="p-2 border-r relative group">
                                    <Input
                                        value={header}
                                        onChange={(e) => handleHeaderChange(i, e.target.value)}
                                        className="h-8 text-sm font-bold bg-transparent border-transparent hover:border-input focus:bg-background"
                                    />
                                    <Button
                                        size="icon"
                                        variant="destructive"
                                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                        onClick={() => removeColumn(i)}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                            <div className="p-2 flex items-center justify-center">
                                <Button variant="ghost" size="icon" onClick={addColumn} title="Add Column">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="divide-y">
                            {specTable.rows.map((row, rowIndex) => (
                                <div key={rowIndex} className="grid hover:bg-muted/10" style={{ gridTemplateColumns: `repeat(${specTable.headers.length}, 1fr) 40px` }}>
                                    {row.map((cell, cellIndex) => (
                                        <div key={cellIndex} className="p-2 border-r">
                                            <Input
                                                value={cell}
                                                onChange={(e) => handleCellChange(rowIndex, cellIndex, e.target.value)}
                                                className="h-8 text-sm border-transparent hover:border-input focus:bg-background"
                                            />
                                        </div>
                                    ))}
                                    <div className="p-2 flex items-center justify-center">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-muted-foreground hover:text-destructive"
                                            onClick={() => removeRow(rowIndex)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button variant="outline" size="sm" onClick={addRow} className="w-full border-dashed">
                        <Plus className="mr-2 h-4 w-4" /> Add Row
                    </Button>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUpdating}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isUpdating}>
                        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
