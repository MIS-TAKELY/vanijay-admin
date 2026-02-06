'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categorySchema } from '@/utils/schemas/popular-searches';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface CategoryFormProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: any;
    onSuccess: () => void;
}

type FormValues = z.infer<typeof categorySchema>;

const CategoryForm = ({ isOpen, onClose, initialData, onSuccess }: CategoryFormProps) => {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting }, setValue, watch } = useForm({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            title: '',
            slug: '',
            isActive: true,
            isIndexed: true,
            displayOrder: 0
        }
    });

    React.useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset({
                    title: initialData.title,
                    slug: initialData.slug,
                    isActive: initialData.isActive,
                    isIndexed: initialData.isIndexed,
                    displayOrder: initialData.displayOrder
                });
            } else {
                reset({
                    title: '',
                    slug: '',
                    isActive: true,
                    isIndexed: true,
                    displayOrder: 0
                });
            }
        }
    }, [isOpen, initialData, reset]);

    const onSubmit = async (data: FormValues) => {
        try {
            const url = initialData
                ? `/api/admin/popular-searches/categories/${initialData.id}`
                : '/api/admin/popular-searches';

            const method = initialData ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Failed to save');

            toast.success(initialData ? 'Category updated' : 'Category created');
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Edit Category' : 'New Category'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" {...register('title')} placeholder="e.g. Power Banks" />
                        {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="slug">Slug</Label>
                        <Input id="slug" {...register('slug')} placeholder="e.g. power-banks" />
                        {errors.slug && <p className="text-sm text-red-500">{errors.slug.message}</p>}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isActive"
                                checked={watch('isActive')}
                                onCheckedChange={(c) => setValue('isActive', c as boolean)}
                            />
                            <Label htmlFor="isActive">Active</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isIndexed"
                                checked={watch('isIndexed')}
                                onCheckedChange={(c) => setValue('isIndexed', c as boolean)}
                            />
                            <Label htmlFor="isIndexed">Index for SEO</Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CategoryForm;
