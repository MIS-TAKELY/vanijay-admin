"use client";

import { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, GripVertical, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import {
    CREATE_CATEGORY_CARD,
    UPDATE_CATEGORY_CARD,
    DELETE_CATEGORY_CARD,
} from "@/graphql/landing-page.queries";
import { FileUpload, FileWithPreview } from "@/components/fileUpload";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";

const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
    }
  }
`;

type CategoryCard = {
    id: string;
    categoryId: string;
    categoryName?: string;
    image?: string;
    count?: string;
    color: string;
    darkColor?: string;
    sortOrder: number;
    isActive: boolean;
};

type Props = {
    cards: CategoryCard[];
    refetch: () => void;
};

export default function CategoryCardsManager({ cards, refetch }: Props) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCard, setEditingCard] = useState<CategoryCard | null>(null);
    const [imageFiles, setImageFiles] = useState<FileWithPreview[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState({
        categoryId: "",
        image: "",
        color: "",
        darkColor: "",
        sortOrder: 0,
        isActive: true,
    });

    const { data: categoriesData } = useQuery(GET_CATEGORIES);
    const [createCard, { loading: creating }] = useMutation(CREATE_CATEGORY_CARD);
    const [updateCard, { loading: updating }] = useMutation(UPDATE_CATEGORY_CARD);
    const [deleteCard, { loading: deleting }] = useMutation(DELETE_CATEGORY_CARD);

    const handleOpenDialog = (card?: CategoryCard) => {
        if (card) {
            setEditingCard(card);
            setFormData({
                categoryId: card.categoryId,
                image: card.image || "",
                color: card.color,
                darkColor: card.darkColor || "",
                sortOrder: card.sortOrder,
                isActive: card.isActive,
            });
            setImageFiles([]);
        } else {
            setEditingCard(null);
            setFormData({
                categoryId: "",
                image: "",
                color: "",
                darkColor: "",
                sortOrder: cards.length,
                isActive: true,
            });
            setImageFiles([]);
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        try {
            if (!formData.categoryId) {
                toast.error("Please select a category");
                return;
            }

            let imageUrl = formData.image;

            if (imageFiles.length > 0 && imageFiles[0].file) {
                setIsUploading(true);
                try {
                    const result = await uploadToCloudinary(imageFiles[0].file);
                    imageUrl = result.url;
                } catch (error) {
                    console.error("Upload failed:", error);
                    toast.error("Failed to upload image");
                    setIsUploading(false);
                    return;
                }
                setIsUploading(false);
            }

            const input = {
                categoryId: formData.categoryId,
                image: imageUrl || null,
                color: formData.color,
                darkColor: formData.darkColor || null,
                sortOrder: formData.sortOrder,
                isActive: formData.isActive,
            };

            if (editingCard) {
                await updateCard({
                    variables: { id: editingCard.id, input },
                });
                toast.success("Category card updated successfully");
            } else {
                await createCard({
                    variables: { input },
                });
                toast.success("Category card created successfully");
            }

            setIsDialogOpen(false);
            refetch();
        } catch (error: any) {
            toast.error(error.message || "Failed to save category card");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this category card?")) return;

        try {
            await deleteCard({ variables: { id } });
            toast.success("Category card deleted successfully");
            refetch();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete category card");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category Card
                </Button>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12"></TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Image</TableHead>
                            <TableHead>Count</TableHead>
                            <TableHead>Color</TableHead>
                            <TableHead>Sort Order</TableHead>
                            <TableHead>Active</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {cards.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                                    No category cards found. Create one to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            cards.map((card) => (
                                <TableRow key={card.id}>
                                    <TableCell>
                                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {card.categoryName || "Unknown Category"}
                                    </TableCell>
                                    <TableCell>
                                        {card.image ? (
                                            <img
                                                src={card.image}
                                                alt={card.categoryName}
                                                className="w-8 h-8 object-cover rounded"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                                                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>{card.count || "-"}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-12 h-6 rounded bg-gradient-to-r ${card.color}`} />
                                            <code className="text-xs">{card.color}</code>
                                        </div>
                                    </TableCell>
                                    <TableCell>{card.sortOrder}</TableCell>
                                    <TableCell>
                                        <Switch checked={card.isActive} disabled />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleOpenDialog(card)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(card.id)}
                                                disabled={deleting}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingCard ? "Edit Category Card" : "Create Category Card"}
                        </DialogTitle>
                        <DialogDescription>
                            Configure the category card that will appear on the homepage
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category *</Label>
                                <Select
                                    value={formData.categoryId}
                                    onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categoriesData?.categories?.map((category: any) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Image</Label>
                                <div className="space-y-4">
                                    <FileUpload
                                        value={imageFiles}
                                        onChange={setImageFiles}
                                        maxFiles={1}
                                    />

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-background px-2 text-muted-foreground">Or use URL</span>
                                        </div>
                                    </div>

                                    <Input
                                        id="image"
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sortOrder">Sort Order *</Label>
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

                        <div className="space-y-2">
                            <Label htmlFor="color">Color (Tailwind gradient) *</Label>
                            <Input
                                id="color"
                                value={formData.color}
                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                placeholder="from-blue-500 to-purple-600"
                            />
                            <div className={`w-full h-12 rounded bg-gradient-to-r ${formData.color}`} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="darkColor">Dark Color (optional)</Label>
                            <Input
                                id="darkColor"
                                value={formData.darkColor}
                                onChange={(e) => setFormData({ ...formData, darkColor: e.target.value })}
                                placeholder="from-blue-600 to-purple-700"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={creating || updating || isUploading}>
                            {isUploading ? "Uploading..." : creating || updating ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
