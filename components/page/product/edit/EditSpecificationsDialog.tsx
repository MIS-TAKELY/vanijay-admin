"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useMutation, gql } from "@apollo/client";
import { transformProductToFormData } from "@/utils/product/transformProductData";
import { buildProductInput } from "@/utils/product/validateSteps";
import { Loader2, Plus, Trash2, GripVertical, Clipboard, X } from "lucide-react";
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

import { SpecificationSection } from "@/types/pages/product";

export default function EditSpecificationsDialog({ product, open, onOpenChange, onSuccess }: EditSpecificationsDialogProps) {
    const [specSections, setSpecSections] = useState<SpecificationSection[]>([
        { title: "Technical Specifications", headers: ["Attribute", "Value"], rows: [["", ""]] }
    ]);

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

                if (Array.isArray(parsed)) {
                    setSpecSections(parsed.length > 0 ? parsed : [{ title: "Technical Specifications", headers: ["Attribute", "Value"], rows: [["", ""]] }]);
                } else if (parsed && Array.isArray(parsed.headers) && Array.isArray(parsed.rows)) {
                    setSpecSections([{
                        title: "Technical Specifications",
                        headers: parsed.headers,
                        rows: parsed.rows
                    }]);
                } else {
                    // Fallback to variants
                    const defaultVar = product.variants?.find((v: any) => v.isDefault) || product.variants?.[0];
                    if (defaultVar?.specifications?.length) {
                        setSpecSections([{
                            title: "Technical Specifications",
                            headers: ["Attribute", "Value"],
                            rows: defaultVar.specifications.map((s: any) => [s.key, s.value])
                        }]);
                    } else {
                        setSpecSections([{ title: "Technical Specifications", headers: ["Attribute", "Value"], rows: [["", ""]] }]);
                    }
                }
            } catch (e) {
                setSpecSections([{ title: "Technical Specifications", headers: ["Attribute", "Value"], rows: [["", ""]] }]);
            }
        }
    }, [open, product]);

    const handleSectionTitleChange = (index: number, title: string) => {
        const newSections = [...specSections];
        newSections[index] = { ...newSections[index], title };
        setSpecSections(newSections);
    };

    const handleHeaderChange = (sectionIdx: number, headerIdx: number, value: string) => {
        const newSections = [...specSections];
        const newHeaders = [...newSections[sectionIdx].headers];
        newHeaders[headerIdx] = value;
        newSections[sectionIdx] = { ...newSections[sectionIdx], headers: newHeaders };
        setSpecSections(newSections);
    };

    const handleCellChange = (sectionIdx: number, rowIndex: number, cellIdx: number, value: string) => {
        const newSections = [...specSections];
        const newRows = [...newSections[sectionIdx].rows];
        newRows[rowIndex] = [...newRows[rowIndex]];
        newRows[rowIndex][cellIdx] = value;
        newSections[sectionIdx] = { ...newSections[sectionIdx], rows: newRows };
        setSpecSections(newSections);
    };

    const addSection = () => {
        setSpecSections(prev => [
            ...prev,
            { title: `Section ${prev.length + 1}`, headers: ["Attribute", "Value"], rows: [["", ""]] }
        ]);
    };

    const removeSection = (index: number) => {
        setSpecSections(prev => prev.filter((_, i) => i !== index));
    };

    const addRow = (sectionIdx: number) => {
        const section = specSections[sectionIdx];
        const newRow = new Array(section.headers.length).fill("");
        const newSections = [...specSections];
        newSections[sectionIdx] = { ...section, rows: [...section.rows, newRow] };
        setSpecSections(newSections);
    };

    const removeRow = (sectionIdx: number, rowIdx: number) => {
        const section = specSections[sectionIdx];
        const newRows = section.rows.filter((_, i) => i !== rowIdx);
        const newSections = [...specSections];
        newSections[sectionIdx] = {
            ...section,
            rows: newRows.length > 0 ? newRows : [new Array(section.headers.length).fill("")]
        };
        setSpecSections(newSections);
    };

    const addColumn = (sectionIdx: number) => {
        const section = specSections[sectionIdx];
        const newSections = [...specSections];
        newSections[sectionIdx] = {
            ...section,
            headers: [...section.headers, "New Column"],
            rows: section.rows.map(row => [...row, ""])
        };
        setSpecSections(newSections);
    };

    const removeColumn = (sectionIdx: number, colIdx: number) => {
        const section = specSections[sectionIdx];
        if (section.headers.length <= 1) return;
        const newSections = [...specSections];
        newSections[sectionIdx] = {
            ...section,
            headers: section.headers.filter((_, i) => i !== colIdx),
            rows: section.rows.map(row => row.filter((_, i) => i !== colIdx))
        };
        setSpecSections(newSections);
    };

    const handlePaste = useCallback(
        (sectionIdx: number, e: React.ClipboardEvent) => {
            const parsed = parseTableFromClipboard(e.clipboardData);
            if (parsed) {
                e.preventDefault();
                e.stopPropagation();

                const section = specSections[sectionIdx];
                const hasActualData = section.rows.some(row => row.some(cell => cell.trim()));

                const newSections = [...specSections];
                if (hasActualData && section.headers.length === parsed.headers.length) {
                    const cleanExistingRows = section.rows.filter(row => row.some(cell => cell.trim()));
                    newSections[sectionIdx] = {
                        ...section,
                        rows: [...cleanExistingRows, ...parsed.rows]
                    };
                } else {
                    newSections[sectionIdx] = {
                        ...parsed,
                        title: section.title
                    };
                }
                setSpecSections(newSections);
                toast.success("Table data pasted successfully");
            }
        },
        [specSections]
    );

    const handleSave = async () => {
        try {
            const fullFormData = transformProductToFormData(product);
            let input = buildProductInput(fullFormData);

            // Filter out empty rows from sections
            const cleanedSections = specSections.map(section => ({
                ...section,
                rows: section.rows.filter(row => row.some(cell => cell.trim()))
            })).filter(section => section.rows.length > 0);

            input = {
                ...input,
                specificationTable: JSON.stringify(cleanedSections.length > 0 ? cleanedSections : null)
            };

            await updateProduct({
                variables: {
                    id: product.id,
                    input: input
                }
            });

        } catch (error) {
            console.error("Error saving specifications:", error);
            toast.error("Failed to save changes");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between mr-8">
                        <div>
                            <DialogTitle>Edit Specifications</DialogTitle>
                            <DialogDescription>
                                Modify technical specifications. You can add multiple groups.
                            </DialogDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={addSection} className="gap-2">
                            <Plus className="h-4 w-4" /> Add Group
                        </Button>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground italic bg-muted/30 p-2 rounded-md uppercase font-bold tracking-tight">
                        <Clipboard className="h-3 w-3" />
                        Tip: You can paste (Ctrl+V) a table from Excel or Google Sheets.
                    </div>
                </DialogHeader>

                <div className="space-y-12 py-6">
                    {specSections.map((section, sectionIdx) => (
                        <div key={sectionIdx} className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <Input
                                        value={section.title}
                                        onChange={(e) => handleSectionTitleChange(sectionIdx, e.target.value)}
                                        className="text-lg font-bold h-10 border-transparent hover:border-input focus:bg-background px-0"
                                        placeholder="Group Title (e.g., General Information)"
                                    />
                                </div>
                                {specSections.length > 1 && (
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="text-muted-foreground hover:text-destructive"
                                        onClick={() => removeSection(sectionIdx)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>

                            <div
                                className="border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 outline-none bg-background shadow-sm"
                                onPaste={(e) => handlePaste(sectionIdx, e)}
                                tabIndex={0}
                            >
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm border-collapse">
                                        <thead>
                                            <tr className="bg-muted/30 border-b">
                                                {section.headers.map((header, i) => (
                                                    <th key={i} className="p-0 border-r last:border-r-0 min-w-[150px]">
                                                        <div className="flex items-center group/header">
                                                            <input
                                                                value={header}
                                                                onChange={(e) => handleHeaderChange(sectionIdx, i, e.target.value)}
                                                                className="w-full px-4 py-3 bg-transparent font-bold text-muted-foreground focus:outline-none focus:bg-muted/50 transition-colors"
                                                                placeholder={`Header ${i + 1}`}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeColumn(sectionIdx, i)}
                                                                className="p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover/header:opacity-100 transition-opacity mr-2"
                                                                title="Remove Column"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    </th>
                                                ))}
                                                <th className="p-2 w-12 bg-muted/10">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => addColumn(sectionIdx)}
                                                        className="h-8 w-8 p-0"
                                                        title="Add Column"
                                                    >
                                                        <Plus className="h-4 w-4 text-primary" />
                                                    </Button>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-muted/30">
                                            {section.rows.map((row, rowIndex) => (
                                                <tr key={rowIndex} className="group/row hover:bg-muted/5 transition-colors">
                                                    {row.map((cell, cellIdx) => (
                                                        <td key={cellIdx} className="p-0 border-r last:border-r-0">
                                                            <input
                                                                value={cell}
                                                                onChange={(e) => handleCellChange(sectionIdx, rowIndex, cellIdx, e.target.value)}
                                                                className="w-full px-4 py-3 bg-transparent focus:outline-none focus:bg-muted/20 transition-colors"
                                                                placeholder="..."
                                                            />
                                                        </td>
                                                    ))}
                                                    <td className="p-2 w-12 text-center bg-muted/5">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeRow(sectionIdx, rowIndex)}
                                                            className="p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover/row:opacity-100 transition-opacity"
                                                            title="Remove Row"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="p-2 bg-muted/5 border-t">
                                    <Button variant="ghost" size="sm" onClick={() => addRow(sectionIdx)} className="text-primary hover:bg-primary/5 h-8">
                                        <Plus className="mr-2 h-3 w-3" /> Add Row
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <DialogFooter className="gap-2 sm:gap-0 mt-4 border-t pt-4">
                    <div className="flex-1 flex justify-start">
                        <Button variant="ghost" size="sm" onClick={() => setSpecSections([{ title: "Technical Specifications", headers: ["Attribute", "Value"], rows: [["", ""]] }])} className="text-muted-foreground hover:text-destructive">
                            Reset All
                        </Button>
                    </div>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUpdating}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isUpdating} className="min-w-[120px]">
                        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
