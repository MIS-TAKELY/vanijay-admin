"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useMutation, gql } from "@apollo/client";
import { transformProductToFormData } from "@/utils/product/transformProductData";
import { buildProductInput } from "@/utils/product/validateSteps";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { WarrantyType, ReturnType } from "@/types/common/enums";

const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: String!, $input: UpdateProductInput!) {
    updateProduct(id: $id, input: $input) {
      id
      deliveryOptions { id title }
      warranty { id type }
      returnPolicy { id type }
    }
  }
`;

interface EditDeliveryDialogProps {
    product: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function EditDeliveryDialog({ product, open, onOpenChange, onSuccess }: EditDeliveryDialogProps) {
    const [formDataState, setFormDataState] = useState({
        deliveryOptions: [] as any[],
        warrantyType: WarrantyType.NO_WARRANTY,
        warrantyDuration: "0",
        warrantyUnit: "months",
        warrantyDescription: "",
        returnType: ReturnType.NO_RETURN,
        returnDuration: "0",
        returnUnit: "days",
        returnConditions: "",
    });

    const [updateProduct, { loading: isUpdating }] = useMutation(UPDATE_PRODUCT, {
        onCompleted: () => {
            toast.success("Delivery settings updated successfully");
            onOpenChange(false);
            onSuccess?.();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update delivery settings");
        },
    });

    useEffect(() => {
        if (open && product) {
            const formData = transformProductToFormData(product);
            setFormDataState({
                deliveryOptions: formData.deliveryOptions,
                warrantyType: formData.warrantyType,
                warrantyDuration: formData.warrantyDuration,
                warrantyUnit: formData.warrantyUnit,
                warrantyDescription: formData.warrantyDescription,
                returnType: formData.returnType,
                returnDuration: formData.returnDuration,
                returnUnit: formData.returnUnit,
                returnConditions: formData.returnConditions || formData.returnPolicy || "",
            });
        }
    }, [open, product]);

    const handleDeliveryOptionChange = (index: number, field: string, value: any) => {
        setFormDataState(prev => {
            const newOptions = [...prev.deliveryOptions];
            newOptions[index] = { ...newOptions[index], [field]: value };
            return { ...prev, deliveryOptions: newOptions };
        });
    };

    const addDeliveryOption = () => {
        setFormDataState(prev => ({
            ...prev,
            deliveryOptions: [...prev.deliveryOptions, { title: "", description: "", isDefault: false }]
        }));
    };

    const removeDeliveryOption = (index: number) => {
        setFormDataState(prev => ({
            ...prev,
            deliveryOptions: prev.deliveryOptions.filter((_, i) => i !== index)
        }));
    };

    const handleSave = async () => {
        try {
            const fullFormData = transformProductToFormData(product);

            // Update with new values
            fullFormData.deliveryOptions = formDataState.deliveryOptions;

            fullFormData.warrantyType = formDataState.warrantyType;
            fullFormData.warrantyDuration = formDataState.warrantyDuration;
            fullFormData.warrantyUnit = formDataState.warrantyUnit;
            fullFormData.warrantyDescription = formDataState.warrantyDescription;

            fullFormData.returnType = formDataState.returnType;
            fullFormData.returnDuration = formDataState.returnDuration;
            fullFormData.returnUnit = formDataState.returnUnit;
            fullFormData.returnConditions = formDataState.returnConditions;

            // Build API Input
            const input = buildProductInput(fullFormData);

            await updateProduct({
                variables: {
                    id: product.id,
                    input: input
                }
            });

        } catch (error) {
            console.error("Error saving delivery settings:", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Delivery & Policies</DialogTitle>
                    <DialogDescription>
                        Configure shipping options, warranty details, and return policies.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="delivery" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="delivery">Delivery Options</TabsTrigger>
                        <TabsTrigger value="warranty">Warranty</TabsTrigger>
                        <TabsTrigger value="return">Return Policy</TabsTrigger>
                    </TabsList>

                    <div className="py-4">
                        <TabsContent value="delivery" className="space-y-4">
                            {formDataState.deliveryOptions.map((option, index) => (
                                <div key={index} className="flex gap-4 items-start p-4 border rounded-lg bg-muted/20">
                                    <div className="flex-1 space-y-3">
                                        <div className="space-y-1">
                                            <Label>Title</Label>
                                            <Input
                                                value={option.title}
                                                onChange={(e) => handleDeliveryOptionChange(index, "title", e.target.value)}
                                                placeholder="e.g. Standard Shipping"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Description</Label>
                                            <Input
                                                value={option.description}
                                                onChange={(e) => handleDeliveryOptionChange(index, "description", e.target.value)}
                                                placeholder="Delivery in 3-5 days"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={option.isDefault}
                                                onCheckedChange={(checked) => handleDeliveryOptionChange(index, "isDefault", checked)}
                                            />
                                            <Label className="text-sm font-normal text-muted-foreground">Set as default option</Label>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:bg-destructive/10"
                                        onClick={() => removeDeliveryOption(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button variant="outline" className="w-full border-dashed" onClick={addDeliveryOption}>
                                <Plus className="mr-2 h-4 w-4" /> Add Delivery Option
                            </Button>
                        </TabsContent>

                        <TabsContent value="warranty" className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Warranty Type</Label>
                                    <Select
                                        value={formDataState.warrantyType}
                                        onValueChange={(val) => setFormDataState(prev => ({ ...prev, warrantyType: val as WarrantyType }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={WarrantyType.NO_WARRANTY}>No Warranty</SelectItem>
                                            <SelectItem value={WarrantyType.MANUFACTURER}>Manufacturer Warranty</SelectItem>
                                            <SelectItem value={WarrantyType.SELLER}>Seller Warranty</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-2">
                                        <Label>Duration</Label>
                                        <Input
                                            type="number"
                                            value={formDataState.warrantyDuration}
                                            onChange={(e) => setFormDataState(prev => ({ ...prev, warrantyDuration: e.target.value }))}
                                            disabled={formDataState.warrantyType === WarrantyType.NO_WARRANTY}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Unit</Label>
                                        <Select
                                            value={formDataState.warrantyUnit}
                                            onValueChange={(val) => setFormDataState(prev => ({ ...prev, warrantyUnit: val }))}
                                            disabled={formDataState.warrantyType === WarrantyType.NO_WARRANTY}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="days">Days</SelectItem>
                                                <SelectItem value="months">Months</SelectItem>
                                                <SelectItem value="years">Years</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={formDataState.warrantyDescription}
                                    onChange={(e) => setFormDataState(prev => ({ ...prev, warrantyDescription: e.target.value }))}
                                    placeholder="e.g. Covers manufacturing defects only"
                                    disabled={formDataState.warrantyType === WarrantyType.NO_WARRANTY}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="return" className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Return Type</Label>
                                    <Select
                                        value={formDataState.returnType}
                                        onValueChange={(val) => setFormDataState(prev => ({ ...prev, returnType: val as ReturnType }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={ReturnType.NO_RETURN}>No Returns</SelectItem>
                                            <SelectItem value={ReturnType.REFUND}>Refund</SelectItem>
                                            <SelectItem value={ReturnType.REPLACEMENT}>Replacement</SelectItem>
                                            <SelectItem value={ReturnType.REPLACEMENT_OR_REFUND}>Replacement or Refund</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-2">
                                        <Label>Duration</Label>
                                        <Input
                                            type="number"
                                            value={formDataState.returnDuration}
                                            onChange={(e) => setFormDataState(prev => ({ ...prev, returnDuration: e.target.value }))}
                                            disabled={formDataState.returnType === ReturnType.NO_RETURN}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Unit</Label>
                                        <Select
                                            value={formDataState.returnUnit}
                                            onValueChange={(val) => setFormDataState(prev => ({ ...prev, returnUnit: val }))}
                                            disabled={formDataState.returnType === ReturnType.NO_RETURN}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="days">Days</SelectItem>
                                                <SelectItem value="weeks">Weeks</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Conditions</Label>
                                <Textarea
                                    value={formDataState.returnConditions}
                                    onChange={(e) => setFormDataState(prev => ({ ...prev, returnConditions: e.target.value }))}
                                    placeholder="e.g. Item must be unused and in original packaging"
                                    disabled={formDataState.returnType === ReturnType.NO_RETURN}
                                />
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>

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
