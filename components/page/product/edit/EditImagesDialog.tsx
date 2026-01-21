"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileUpload, FileWithPreview } from "@/components/fileUpload";
import { toast } from "sonner";
import { useMutation, gql } from "@apollo/client";
import { transformProductToFormData } from "@/utils/product/transformProductData";
import { buildProductInput } from "@/utils/product/validateSteps";
import { Loader2 } from "lucide-react";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";
import { MediaType } from "@/types/common/enums";

// Reusing the mutation from EditProductClient
const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: String!, $input: UpdateProductInput!) {
    updateProduct(id: $id, input: $input) {
      id
      name
      images {
        id
        url
        altText
        mediaType
        fileType
        sortOrder
      }
    }
  }
`;

interface EditImagesDialogProps {
    product: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function EditImagesDialog({ product, open, onOpenChange, onSuccess }: EditImagesDialogProps) {
    const [primaryFiles, setPrimaryFiles] = useState<FileWithPreview[]>([]);
    const [promotionalFiles, setPromotionalFiles] = useState<FileWithPreview[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const [updateProduct, { loading: isUpdating }] = useMutation(UPDATE_PRODUCT, {
        onCompleted: () => {
            toast.success("Images updated successfully");
            onOpenChange(false);
            onSuccess?.();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update images");
        },
    });

    useEffect(() => {
        if (open && product) {
            const formData = transformProductToFormData(product);

            setPrimaryFiles(formData.productMedia.map(m => ({
                preview: m.url,
                type: m.fileType === "VIDEO" ? "video" : "image",
                // We don't have the original File object for existing images, but FileUpload handles this gracefully
            })));

            setPromotionalFiles(formData.promotionalMedia.map(m => ({
                preview: m.url,
                type: m.fileType === "VIDEO" ? "video" : "image",
            })));
        }
    }, [open, product]);

    const handleSave = async () => {
        try {
            setIsUploading(true);

            // 1. Upload new files to Cloudinary
            const uploadFiles = async (files: FileWithPreview[]) => {
                return Promise.all(files.map(async (fileItem) => {
                    if (fileItem.file) {
                        // New file, needs upload
                        const result = await uploadToCloudinary(fileItem.file, fileItem.file.type.startsWith("image/") ? "product" : "auto");
                        return {
                            url: result.url,
                            type: fileItem.file.type.startsWith("video/") ? "VIDEO" : "IMAGE",
                        };
                    } else {
                        // Existing file
                        return {
                            url: fileItem.preview,
                            type: fileItem.type === "video" ? "VIDEO" : "IMAGE",
                        };
                    }
                }));
            };

            const uploadedPrimary = await uploadFiles(primaryFiles);
            const uploadedPromotional = await uploadFiles(promotionalFiles);

            // 2. Prepare Form Data
            const formData = transformProductToFormData(product);

            // Update media in form data
            formData.productMedia = uploadedPrimary.map(u => ({
                url: u.url,
                mediaType: MediaType.PRIMARY,
                fileType: u.type as any, // Cast to match enum if needed
                altText: product.name,
            }));

            formData.promotionalMedia = uploadedPromotional.map(u => ({
                url: u.url,
                mediaType: MediaType.PROMOTIONAL,
                fileType: u.type as any,
                altText: `Promotional - ${product.name}`,
            }));
            // 3. Build API Input
            const input = buildProductInput(formData);

            // 4. Call Mutation
            await updateProduct({
                variables: {
                    id: product.id,
                    input: {
                        ...input,
                        // Ensure we strictly send what buildProductInput returns, 
                        // but we might want to ensure other fields are not accidentally zeroed out if transformation was lossy.
                        // For images, we are confident.
                    }
                }
            });

        } catch (error) {
            console.error("Error saving images:", error);
            toast.error("Failed to upload images");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Product Images</DialogTitle>
                    <DialogDescription>
                        Manage primary and promotional images for this product. Drag and drop to reorder.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <h3 className="font-medium text-sm text-foreground">Primary Images</h3>
                        <p className="text-xs text-muted-foreground mb-2">
                            These images appear in the main product gallery. The first image is the main display image. Recommended: Square (1080x1080px).
                        </p>
                        <FileUpload
                            value={primaryFiles}
                            onChange={setPrimaryFiles}
                            maxFiles={10}
                            allowVideo={true}
                        />
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-medium text-sm text-foreground">Promotional Assets</h3>
                        <p className="text-xs text-muted-foreground mb-2">
                            Additional banners or marketing materials displayed below the gallery.
                        </p>
                        <FileUpload
                            value={promotionalFiles}
                            onChange={setPromotionalFiles}
                            maxFiles={5}
                            allowVideo={true}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading || isUpdating}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isUploading || isUpdating}>
                        {(isUploading || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
