'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { keywordSchema } from '@/utils/schemas/popular-searches';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface KeywordFormProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: any;
    categoryId: string;
    onSuccess: () => void;
}

type FormValues = z.infer<typeof keywordSchema>;

const KeywordForm = ({ isOpen, onClose, initialData, categoryId, onSuccess }: KeywordFormProps) => {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting }, setValue, watch } = useForm({
        resolver: zodResolver(keywordSchema),
        defaultValues: {
            name: '',
            href: '',
            targetType: '_self',
            isActive: true,
            isIndexed: true,
            isFeatured: false,
            clickCount: 0,
            displayOrder: 0
        }
    });

    React.useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset({
                    name: initialData.name,
                    href: initialData.href,
                    targetType: initialData.targetType,
                    isActive: initialData.isActive,
                    isIndexed: initialData.isIndexed,
                    isFeatured: initialData.isFeatured,
                    categoryId: categoryId, // Keep parent
                    clickCount: initialData.clickCount,
                    displayOrder: initialData.displayOrder
                });
            } else {
                reset({
                    name: '',
                    href: '',
                    targetType: '_self',
                    isActive: true,
                    isIndexed: true,
                    isFeatured: false,
                    categoryId: categoryId,
                    clickCount: 0,
                    displayOrder: 0
                });
            }
        }
    }, [isOpen, initialData, categoryId, reset]);

    const onSubmit = async (data: FormValues) => {
        try {
            // Ensure categoryId is set
            data.categoryId = categoryId;

            const url = '/api/admin/popular-searches/keywords';
            const method = initialData ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(initialData ? { ...data, id: initialData.id } : data),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Failed to save');

            toast.success(initialData ? 'Keyword updated' : 'Keyword added');
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Edit Keyword' : 'New Keyword'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" {...register('name')} placeholder="e.g. Ambrane Power Banks" />
                        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="href">URL (href)</Label>
                        <Input id="href" {...register('href')} placeholder="/category/power-banks" />
                        {errors.href && <p className="text-sm text-red-500">{errors.href.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="targetType">Target</Label>
                        <Select onValueChange={(v) => setValue('targetType', v as any)} value={watch('targetType')}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select target" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="_self">Same Tab (_self)</SelectItem>
                                <SelectItem value="_blank">New Tab (_blank)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isActiveKw"
                                checked={watch('isActive')}
                                onCheckedChange={(c) => setValue('isActive', c as boolean)}
                            />
                            <Label htmlFor="isActiveKw">Active</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isIndexedKw"
                                checked={watch('isIndexed')}
                                onCheckedChange={(c) => setValue('isIndexed', c as boolean)}
                            />
                            <Label htmlFor="isIndexedKw">Index SEO</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isFeatured"
                                checked={watch('isFeatured')}
                                onCheckedChange={(c) => setValue('isFeatured', c as boolean)}
                            />
                            <Label htmlFor="isFeatured">Featured</Label>
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

export default KeywordForm;
