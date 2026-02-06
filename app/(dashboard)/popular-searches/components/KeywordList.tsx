'use client';

import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { mutate } from 'swr';
import { Badge } from '@/components/ui/badge';

interface KeywordListProps {
    keywords: any[];
    onEdit: (keyword: any) => void;
}

const KeywordList = ({ keywords, onEdit }: KeywordListProps) => {
    const onDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('Delete this keyword?')) return;
        try {
            await fetch(`/api/admin/popular-searches/keywords/${id}`, { method: 'DELETE' });
            toast.success('Keyword deleted');
            mutate('/api/admin/popular-searches'); // Refresh
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    if (keywords.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                No keywords yet. Add one to get started.
            </div>
        );
    }

    return (
        <Droppable droppableId="keywords-list" type="KEYWORD">
            {(provided) => (
                <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                >
                    {keywords.map((keyword, index) => (
                        <Draggable key={keyword.id} draggableId={keyword.id} index={index}>
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={cn(
                                        "flex items-center gap-4 p-3 rounded-md border bg-white shadow-sm transition-all group",
                                        snapshot.isDragging && "shadow-xl ring-2 ring-primary rotate-1"
                                    )}
                                >
                                    <div {...provided.dragHandleProps} className="text-muted-foreground cursor-grab active:cursor-grabbing">
                                        <GripVertical className="w-5 h-5" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium truncate">{keyword.name}</span>
                                            {!keyword.isActive && <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                                            {keyword.isFeatured && <Badge variant="default" className="text-xs bg-amber-500 hover:bg-amber-600">Featured</Badge>}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <code className="bg-muted px-1 rounded max-w-[200px] truncate">{keyword.href}</code>
                                            <span>•</span>
                                            <span>{keyword.clickCount} clicks</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" asChild>
                                            <a href={keyword.href} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => onEdit(keyword)}>
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={(e) => onDelete(e, keyword.id)}>
                                            <Trash2 className="w-4 h-4" />
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

export default KeywordList;
