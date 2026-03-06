"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useMutation, gql } from "@apollo/client";
import { transformProductToFormData } from "@/utils/product/transformProductData";
import { buildProductInput } from "@/utils/product/validateSteps";
import { Loader2 } from "lucide-react";
import { ProductStatus } from "@/types/common/enums";

const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: String!, $input: UpdateProductInput!) {
    updateProduct(id: $id, input: $input) {
      id
      name
      brand
      description
      status
      pros
      cons
      affiliateLink
    }
  }
`;

interface EditBasicInfoDialogProps {
    product: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function EditBasicInfoDialog({ product, open, onOpenChange, onSuccess }: EditBasicInfoDialogProps) {
    const [formDataState, setFormDataState] = useState({
        name: "",
        brand: "",
        description: "",
        status: ProductStatus.DRAFT,
        pros: "",
        cons: "",
        affiliateLink: "",
    });

    const [updateProduct, { loading: isUpdating }] = useMutation(UPDATE_PRODUCT, {
        onCompleted: () => {
            toast.success("Product info updated successfully");
            onOpenChange(false);
            onSuccess?.();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update product info");
        },
    });

    useEffect(() => {
        if (open && product) {
            const formData = transformProductToFormData(product);
            setFormDataState({
                name: formData.name,
                brand: formData.brand,
                description: formData.description,
                status: formData.status,
                pros: formData.pros,
                cons: formData.cons,
                affiliateLink: formData.affiliateLink,
            });
        }
    }, [open, product]);

    const handleSave = async () => {
        if (!formDataState.name.trim()) {
            toast.error("Product name is required");
            return;
        }

        try {
            // 1. Get full form data from product
            const fullFormData = transformProductToFormData(product);

            // 2. Update with new values
            fullFormData.name = formDataState.name;
            fullFormData.brand = formDataState.brand;
            fullFormData.description = formDataState.description;
            fullFormData.status = formDataState.status;
            fullFormData.pros = formDataState.pros;
            fullFormData.cons = formDataState.cons;
            fullFormData.affiliateLink = formDataState.affiliateLink;

            // 3. Build API Input
            const input = buildProductInput(fullFormData);

            // 4. Call Mutation
            await updateProduct({
                variables: {
                    id: product.id,
                    input: {
                        ...input,
                    }
                }
            });

        } catch (error) {
            console.error("Error saving basic info:", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Basic Information</DialogTitle>
                    <DialogDescription>
                        Update the core details of your product.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Product Name</Label>
                        <Input
                            id="name"
                            value={formDataState.name}
                            onChange={(e) => setFormDataState(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter product name"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="brand">Brand</Label>
                            <Input
                                id="brand"
                                value={formDataState.brand}
                                onChange={(e) => setFormDataState(prev => ({ ...prev, brand: e.target.value }))}
                                placeholder="Enter brand name"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formDataState.status}
                                onValueChange={(value) => setFormDataState(prev => ({ ...prev, status: value as ProductStatus }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                                    <SelectItem value="DRAFT">Draft</SelectItem>
                                    <SelectItem value="DISCONTINUED">Discontinued</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formDataState.description}
                            onChange={(e) => setFormDataState(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Enter product description"
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="pros">Pros (comma separated)</Label>
                            <Textarea
                                id="pros"
                                value={formDataState.pros}
                                onChange={(e) => setFormDataState(prev => ({ ...prev, pros: e.target.value }))}
                                placeholder="High performance, Great battery life..."
                                className="min-h-[80px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cons">Cons (comma separated)</Label>
                            <Textarea
                                id="cons"
                                value={formDataState.cons}
                                onChange={(e) => setFormDataState(prev => ({ ...prev, cons: e.target.value }))}
                                placeholder="Expensive, Heavy..."
                                className="min-h-[80px]"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="affiliateLink">Affiliate Link</Label>
                        <Input
                            id="affiliateLink"
                            value={formDataState.affiliateLink}
                            onChange={(e) => setFormDataState(prev => ({ ...prev, affiliateLink: e.target.value }))}
                            placeholder="https://amazon.com/..."
                        />
                    </div>
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
