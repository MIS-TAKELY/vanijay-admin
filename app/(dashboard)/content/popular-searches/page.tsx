'use client';

import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { toast } from 'sonner';
import CategoryList from './components/CategoryList';
import KeywordList from './components/KeywordList';
import CategoryForm from './components/CategoryForm';
import KeywordForm from './components/KeywordForm';
import ImportExport from './components/ImportExport';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PopularSearchesPage() {
    const { data: categories, error, mutate: mutateCategories } = useSWR('/api/admin/popular-searches', fetcher);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
    const [isKeywordFormOpen, setIsKeywordFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [editingKeyword, setEditingKeyword] = useState<any>(null);

    const selectedCategory = categories?.find((c: any) => c.id === selectedCategoryId) || (categories && categories.length > 0 ? categories[0] : null);

    // Auto-select first category if none selected
    React.useEffect(() => {
        if (!selectedCategoryId && categories && categories.length > 0) {
            setSelectedCategoryId(categories[0].id);
        }
    }, [categories, selectedCategoryId]);

    const onDragEnd = async (result: DropResult) => {
        const { source, destination, type } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        if (type === 'CATEGORY') {
            // Optimistic update
            const newCategories = Array.from(categories);
            const [moved] = newCategories.splice(source.index, 1);
            newCategories.splice(destination.index, 0, moved);

            // Update displayOrder
            const updates = newCategories.map((cat: any, index) => ({
                id: cat.id,
                order: index
            }));

            // Re-assign order locally to avoid flicker
            newCategories.forEach((c: any, i) => c.displayOrder = i);

            mutateCategories(newCategories, false);

            try {
                await fetch('/api/admin/popular-searches/reorder', {
                    method: 'POST',
                    body: JSON.stringify({ type: 'category', items: updates }),
                });
                toast.success('Categories reordered');
            } catch (error) {
                toast.error('Failed to reorder');
                mutateCategories();
            }
        } else if (type === 'KEYWORD') {
            if (!selectedCategory) return;
            const keywords = Array.from(selectedCategory.keywords || []);
            const [moved] = keywords.splice(source.index, 1);
            keywords.splice(destination.index, 0, moved);

            // Optimistic update for keywords (tricky with nested data in SWR)
            // We'll just update the specific category in the list
            const newCategories = categories.map((c: any) => {
                if (c.id === selectedCategory.id) {
                    return { ...c, keywords: keywords.map((k: any, i: number) => ({ ...k, displayOrder: i })) };
                }
                return c;
            });

            const updates = keywords.map((k: any, index) => ({
                id: k.id,
                order: index
            }));

            mutateCategories(newCategories, false);

            try {
                await fetch('/api/admin/popular-searches/reorder', {
                    method: 'POST',
                    body: JSON.stringify({ type: 'keyword', items: updates }),
                });
                toast.success('Keywords reordered');
            } catch (error) {
                toast.error('Failed to reorder');
                mutateCategories();
            }
        }
    };

    if (error) return <div>Failed to load</div>;
    if (!categories) return <div>Loading...</div>;

    return (
        <div className="p-6 h-[calc(100vh-4rem)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Popular Searches</h1>
                    <p className="text-gray-500">Manage popular search categories and keywords</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => { setEditingCategory(null); setIsCategoryFormOpen(true); }}>
                        <Plus className="w-4 h-4 mr-2" /> Add Category
                    </Button>
                </div>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex gap-6 flex-1 min-h-0">
                    {/* Categories Panel */}
                    <div className="w-1/3 border rounded-lg bg-card flex flex-col">
                        <div className="p-4 border-b bg-muted/20 font-semibold">Categories</div>
                        <div className="flex-1 overflow-y-auto p-2">
                            <CategoryList
                                categories={categories}
                                selectedId={selectedCategoryId || selectedCategory?.id}
                                onSelect={setSelectedCategoryId}
                                onEdit={(cat) => { setEditingCategory(cat); setIsCategoryFormOpen(true); }}
                            />
                        </div>
                    </div>

                    {/* Keywords Panel */}
                    <div className="flex-1 border rounded-lg bg-card flex flex-col">
                        <div className="p-4 border-b bg-muted/20 flex justify-between items-center">
                            <span className="font-semibold">
                                {selectedCategory ? `Keywords for "${selectedCategory.title}"` : 'Select a category'}
                            </span>
                            {selectedCategory && (
                                <Button size="sm" variant="outline" onClick={() => { setEditingKeyword(null); setIsKeywordFormOpen(true); }}>
                                    <Plus className="w-4 h-4 mr-2" /> Add Keyword
                                </Button>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 bg-slate-50">
                            {selectedCategory && (
                                <KeywordList
                                    keywords={selectedCategory.keywords || []}
                                    onEdit={(kw) => { setEditingKeyword(kw); setIsKeywordFormOpen(true); }}
                                />
                            )}
                            {!selectedCategory && (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    Select a category to view keywords
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DragDropContext>

            {/* Modals */}
            <CategoryForm
                isOpen={isCategoryFormOpen}
                onClose={() => setIsCategoryFormOpen(false)}
                initialData={editingCategory}
                onSuccess={() => mutateCategories()}
            />

            {selectedCategory && (
                <KeywordForm
                    isOpen={isKeywordFormOpen}
                    onClose={() => setIsKeywordFormOpen(false)}
                    initialData={editingKeyword}
                    categoryId={selectedCategory.id}
                    onSuccess={() => mutateCategories()}
                />
            )}
        </div>
    );
}
