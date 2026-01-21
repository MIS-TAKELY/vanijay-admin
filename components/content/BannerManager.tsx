"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
    Card,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Plus, Pencil, Trash2, ExternalLink, Video, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

import {
    CREATE_LANDING_PAGE_BANNER,
    UPDATE_LANDING_PAGE_BANNER,
    DELETE_LANDING_PAGE_BANNER,
    GET_LANDING_PAGE_BANNERS,
} from "@/graphql/landing-page-banner.queries";
import { FileUpload, FileWithPreview } from "@/components/fileUpload";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";
import Image from "next/image";

type Banner = {
    id: string;
    title: string;
    description?: string;
    imageUrl: string;
    link?: string;
    sortOrder: number;
    isActive: boolean;
    mediaType?: "IMAGE" | "VIDEO";
};

type Props = {
    banners: Banner[];
    refetch: () => void;
};

export default function BannerManager({ banners, refetch }: Props) {
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
    const [imageFiles, setImageFiles] = useState<FileWithPreview[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        imageUrl: "",
        link: "",
        sortOrder: 0,
        isActive: true,
        mediaType: "IMAGE",
    });

    const [createBanner, { loading: creating }] = useMutation(CREATE_LANDING_PAGE_BANNER, {
        update(cache, { data: { createLandingPageBanner } }) {
            if (createLandingPageBanner?.success && createLandingPageBanner?.banner) {
                const existingData: any = cache.readQuery({ query: GET_LANDING_PAGE_BANNERS });
                if (existingData) {
                    cache.writeQuery({
                        query: GET_LANDING_PAGE_BANNERS,
                        data: {
                            getLandingPageBanners: [...existingData.getLandingPageBanners, createLandingPageBanner.banner],
                        },
                    });
                }
            }
        }
    });
    const [updateBanner, { loading: updating }] = useMutation(UPDATE_LANDING_PAGE_BANNER);
    const [deleteBanner, { loading: deleting }] = useMutation(DELETE_LANDING_PAGE_BANNER, {
        update(cache, { data: { deleteLandingPageBanner } }, { variables }) {
            if (deleteLandingPageBanner?.success) {
                const existingData: any = cache.readQuery({ query: GET_LANDING_PAGE_BANNERS });
                if (existingData) {
                    cache.writeQuery({
                        query: GET_LANDING_PAGE_BANNERS,
                        data: {
                            getLandingPageBanners: existingData.getLandingPageBanners.filter(
                                (b: any) => b.id !== variables?.id
                            ),
                        },
                    });
                }
            }
        }
    });

    const handleOpenSheet = (banner?: Banner) => {
        if (banner) {
            setEditingBanner(banner);
            setFormData({
                title: banner.title,
                description: banner.description || "",
                imageUrl: banner.imageUrl,
                link: banner.link || "",
                sortOrder: banner.sortOrder,
                isActive: banner.isActive,
                mediaType: banner.mediaType as any || "IMAGE",
            });
            setImageFiles([]);
        } else {
            setEditingBanner(null);
            setFormData({
                title: "",
                description: "",
                imageUrl: "",
                link: "",
                sortOrder: banners.length,
                isActive: true,
                mediaType: "IMAGE",
            });
            setImageFiles([]);
        }
        setIsSheetOpen(true);
    };

    const handleSubmit = async () => {
        try {
            let imageUrl = formData.imageUrl;
            let mediaType = formData.mediaType;

            if (imageFiles.length > 0 && imageFiles[0].file) {
                setIsUploading(true);
                try {
                    const file = imageFiles[0].file;
                    const resourceType = file.type.startsWith("video/") ? "video" : "image";
                    const result = await uploadToCloudinary(file, resourceType === "image" ? "banner" : "auto");
                    imageUrl = result.url;
                    mediaType = resourceType === "video" ? "VIDEO" : "IMAGE";
                } catch (error) {
                    console.error("Upload failed:", error);
                    toast.error("Failed to upload file");
                    setIsUploading(false);
                    return;
                }
                setIsUploading(false);
            }

            const input = {
                title: formData.title,
                description: formData.description,
                imageUrl: imageUrl,
                link: formData.link,
                sortOrder: formData.sortOrder,
                isActive: formData.isActive,
                mediaType: mediaType,
            };

            if (editingBanner) {
                await updateBanner({
                    variables: { id: editingBanner.id, input },
                    optimisticResponse: {
                        updateLandingPageBanner: {
                            __typename: "BannerResponse",
                            success: true,
                            message: "Banner updated successfully",
                            banner: {
                                __typename: "LandingPageBanner",
                                id: editingBanner.id,
                                ...input,
                            }
                        }
                    }
                });
                toast.success("Banner updated successfully");
            } else {
                await createBanner({
                    variables: { input },
                });
                toast.success("Banner created successfully");
            }

            setIsSheetOpen(false);
            // refetch(); // No longer needed with cache updates
        } catch (error: any) {
            toast.error(error.message || "Failed to save banner");
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this banner?")) return;

        try {
            await deleteBanner({
                variables: { id },
                optimisticResponse: {
                    deleteLandingPageBanner: {
                        __typename: "BannerResponse",
                        success: true,
                        message: "Banner deleted successfully"
                    }
                }
            });
            toast.success("Banner deleted successfully");
            // refetch(); // No longer needed with cache updates
        } catch (error: any) {
            toast.error(error.message || "Failed to delete banner");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Hero Banners</h2>
                    <p className="text-muted-foreground">Manage your homepage hero carousel.</p>
                </div>
                <Button onClick={() => handleOpenSheet()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Banner
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {banners.map((banner) => (
                    <Card key={banner.id} className="group overflow-hidden relative border-0 shadow-md flex flex-col h-[300px] cursor-pointer" onClick={() => handleOpenSheet(banner)}>
                        <div className="relative h-[200px] w-full bg-muted">
                            {banner.mediaType === "VIDEO" ? (
                                <div className="w-full h-full flex items-center justify-center bg-black/10">
                                    <video src={banner.imageUrl} className="w-full h-full object-cover" muted loop />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                        <Video className="w-10 h-10 text-white opacity-70" />
                                    </div>
                                </div>
                            ) : (
                                <Image
                                    src={banner.imageUrl}
                                    alt={banner.title}
                                    fill
                                    className="object-cover transition-transform group-hover:scale-105"
                                />
                            )}

                            {!banner.isActive && (
                                <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs font-medium">
                                    Inactive
                                </div>
                            )}

                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                <h3 className="text-white font-semibold truncate">{banner.title}</h3>
                            </div>
                        </div>

                        <CardContent className="flex-1 p-4 flex flex-col justify-between">
                            <div className="text-sm text-muted-foreground line-clamp-2">
                                {banner.description || "No description"}
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                                    Order: {banner.sortOrder}
                                </span>
                                {banner.link && (
                                    <span className="flex items-center text-xs text-blue-500">
                                        <ExternalLink className="h-3 w-3 mr-1" /> Link
                                    </span>
                                )}
                            </div>
                        </CardContent>

                        {/* Hover Actions */}
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8 rounded-full shadow-lg"
                                onClick={(e) => handleDelete(banner.id, e)}
                                disabled={deleting}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </Card>
                ))}

                {banners.length === 0 && (
                    <div className="col-span-full text-center py-12 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">No banners found. Create one to get started.</p>
                    </div>
                )}
            </div>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="overflow-y-auto sm:max-w-md w-full">
                    <SheetHeader>
                        <SheetTitle>
                            {editingBanner ? "Edit Banner" : "Create Banner"}
                        </SheetTitle>
                        <SheetDescription>
                            Configure the hero banner details and media.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="grid gap-6 py-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Summer Sale"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Up to 50% off on all items"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Media (Image or Video)</Label>
                            <FileUpload
                                value={imageFiles}
                                onChange={setImageFiles}
                                maxFiles={1}
                                allowVideo={true}
                            />
                            <p className="text-xs text-muted-foreground mt-1">Recommended: Landscape (1920x600px)</p>

                            <div className="relative my-2">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">Or URL</span>
                                </div>
                            </div>

                            <Input
                                id="imageUrl"
                                value={formData.imageUrl}
                                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="link">Link (optional)</Label>
                            <Input
                                id="link"
                                value={formData.link}
                                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                placeholder="/shop/..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sortOrder">Sort Order</Label>
                                <Input
                                    id="sortOrder"
                                    type="number"
                                    value={formData.sortOrder}
                                    onChange={(e) =>
                                        setFormData({ ...formData, sortOrder: parseInt(e.target.value) })
                                    }
                                />
                            </div>

                            <div className="space-y-2 flex flex-col justify-end pb-2">
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
                        </div>
                    </div>

                    <SheetFooter>
                        <Button variant="outline" onClick={() => setIsSheetOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={creating || updating || isUploading}>
                            {isUploading ? "Uploading..." : creating || updating ? "Saving..." : "Save"}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    );
}
