"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { useMutation, gql } from "@apollo/client";

const BULK_CREATE_PRODUCTS = gql`
  mutation BulkCreateProducts($input: [BulkCreateProductInput!]!) {
    bulkCreateProducts(input: $input) {
      id
      name
    }
  }
`;

interface BulkProductImportProps {
    onSuccess?: () => void;
}

export default function BulkProductImport({ onSuccess }: BulkProductImportProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isImporting, setIsImporting] = useState(false);

    const [bulkCreateProducts] = useMutation(BULK_CREATE_PRODUCTS, {
        onCompleted: (data) => {
            toast.success(`Successfully imported ${data.bulkCreateProducts.length} products`);
            setIsImporting(false);
            onSuccess?.();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to import products");
            setIsImporting(false);
        },
    });

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const csv = event.target?.result as string;
                const lines = csv.split("\n");
                const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

                const products = [];
                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;

                    // Simple CSV parser (doesn't handle commas in quotes perfectly, but sufficient for now)
                    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));

                    if (values.length < 8) continue; // Basic sanity check

                    const product: any = {
                        name: values[0],
                        description: values[1],
                        brand: values[2],
                        categoryName: values[3],
                        price: parseInt(values[4]),
                        mrp: parseInt(values[5]),
                        stock: parseInt(values[6]),
                        sku: values[7],
                        affiliateLink: values[8] || "",
                        pros: values[9] ? values[9].split(";").map(p => p.trim()) : [],
                        cons: values[10] ? values[10].split(";").map(c => c.trim()) : [],
                        status: "ACTIVE"
                    };

                    if (isNaN(product.price) || isNaN(product.stock)) {
                        console.warn(`Skipping invalid row ${i + 1}: Price or Stock is not a number`);
                        continue;
                    }

                    products.push(product);
                }

                if (products.length === 0) {
                    toast.error("No valid products found in CSV");
                    setIsImporting(false);
                    return;
                }

                await bulkCreateProducts({
                    variables: {
                        input: products,
                    },
                });
            } catch (err) {
                console.error("Import error:", err);
                toast.error("Error parsing CSV file");
                setIsImporting(false);
            }
        };
        reader.readAsText(file);

        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const downloadSampleCSV = () => {
        const headers = "Name,Description,Brand,CategoryName,Price,MRP,Stock,SKU,AffiliateLink,Pros,Cons";
        const sample = "\niPhone 15,Latest Apple iPhone,Apple,Mobile Phones,80000,85000,50,IP15-80,https://affiliate.example.com/ip15,Great Camera;Stunning Screen,Expensive;No charger in box";
        const blob = new Blob([headers + sample], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "sample_bulk_products.csv";
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="flex items-center gap-2">
            <input
                type="file"
                accept=".csv"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImport}
                disabled={isImporting}
            />
            <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className="gap-2"
            >
                {isImporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Upload className="w-4 h-4" />
                )}
                Import CSV
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={downloadSampleCSV}
                disabled={isImporting}
                className="text-xs text-muted-foreground hover:text-primary"
            >
                <FileSpreadsheet className="w-3 h-3 mr-1" />
                Download Sample
            </Button>
        </div>
    );
}
