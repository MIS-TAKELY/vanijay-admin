'use client';

import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { mutate } from 'swr';

interface CategoryListProps {
    categories: any[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onEdit: (category: any) => void;
}

const CategoryList = ({ categories, selectedId, onSelect, onEdit }: CategoryListProps) => {
    const onDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('Are you sure? This will delete all keywords in this category.')) return;

        try {
            await fetch(`/api/admin/popular-searches/categories/${id}`, { method: 'DELETE' });
            toast.success('Category deleted');
            mutate('/api/admin/popular-searches'); // Refresh
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    return (
        <Droppable droppableId="categories-list" type="CATEGORY">
            {(provided) => (
                <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                >
                    {categories.map((category, index) => (
                        <Draggable key={category.id} draggableId={category.id} index={index}>
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    onClick={() => onSelect(category.id)}
                                    className={cn(
                                        "flex items-center gap-3 p-3 rounded-md border text-sm cursor-pointer transition-colors bg-white",
                                        selectedId === category.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-accent",
                                        snapshot.isDragging && "shadow-lg opacity-80"
                                    )}
                                >
                                    <div {...provided.dragHandleProps} className="text-muted-foreground cursor-grab active:cursor-grabbing">
                                        <GripVertical className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 font-medium truncate">
                                        {category.title}
                                        {!category.isActive && <span className="ml-2 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">(Inactive)</span>}
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onEdit(category); }}>
                                            <Pencil className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={(e) => onDelete(e, category.id)}>
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Draggable>
                    ))}
                    {provided.placeholder}
                </div>
            )}
        </Droppable>
    );
};

export default CategoryList;
