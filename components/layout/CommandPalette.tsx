'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
    Search,
    LayoutDashboard,
    Users,
    ShoppingBag,
    Settings,
    Store,
    Globe,
    Command,
    ArrowRight
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

const navItems = [
    { href: '/', label: 'Overview', icon: LayoutDashboard, category: 'Navigation' },
    { href: '/users', label: 'Users', icon: Users, category: 'Navigation' },
    { href: '/sellers', label: 'Sellers', icon: Store, category: 'Navigation' },
    { href: '/products', label: 'Products', icon: ShoppingBag, category: 'Navigation' },
    { href: '/content', label: 'Content', icon: Globe, category: 'Navigation' },
    { href: '/settings', label: 'Settings', icon: Settings, category: 'Settings' },
];

export function CommandPalette() {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const router = useRouter();

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const filteredItems = React.useMemo(() => {
        if (!search) return navItems;
        return navItems.filter((item) =>
            item.label.toLowerCase().includes(search.toLowerCase()) ||
            item.category.toLowerCase().includes(search.toLowerCase())
        );
    }, [search]);

    React.useEffect(() => {
        setSelectedIndex(0);
    }, [search]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((i) => (i + 1) % filteredItems.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((i) => (i - 1 + filteredItems.length) % filteredItems.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredItems[selectedIndex]) {
                onSelect(filteredItems[selectedIndex].href);
            }
        }
    };

    const onSelect = (href: string) => {
        router.push(href);
        setOpen(false);
        setSearch('');
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden border-none bg-transparent shadow-none">
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
                        <div className="flex items-center px-4 border-b border-border/50">
                            <Search className="h-5 w-5 text-muted-foreground" />
                            <Input
                                autoFocus
                                placeholder="Type a command or search..."
                                className="flex-1 border-none shadow-none focus-visible:ring-0 h-14 text-lg bg-transparent"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted/50 border border-border/50 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                <Command className="h-3 w-3" /> K
                            </div>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-primary/10">
                            {filteredItems.length === 0 ? (
                                <div className="py-12 text-center text-muted-foreground">
                                    <Search className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                    <p className="font-medium">No results found for "{search}"</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Groups could be added here if we had more categories */}
                                    <div className="grid gap-1">
                                        {filteredItems.map((item, index) => {
                                            const Icon = item.icon;
                                            const isActive = index === selectedIndex;
                                            return (
                                                <button
                                                    key={item.href}
                                                    onClick={() => onSelect(item.href)}
                                                    onMouseEnter={() => setSelectedIndex(index)}
                                                    className={cn(
                                                        "flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-200 group/item",
                                                        isActive
                                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
                                                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "h-8 w-8 rounded-lg flex items-center justify-center transition-colors",
                                                            isActive ? "bg-white/20" : "bg-muted group-hover/item:bg-card"
                                                        )}>
                                                            <Icon className="h-4 w-4" />
                                                        </div>
                                                        <div className="flex flex-col items-start">
                                                            <span className="font-bold text-sm">{item.label}</span>
                                                            <span className={cn(
                                                                "text-[10px] font-medium uppercase tracking-widest",
                                                                isActive ? "text-white/60" : "text-muted-foreground/60"
                                                            )}>
                                                                {item.category}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {isActive && (
                                                        <ArrowRight className="h-4 w-4 animate-in slide-in-from-left-2 duration-300" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="px-4 py-3 bg-muted/50 border-t border-border/50 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                            <div className="flex gap-4">
                                <span className="flex items-center gap-2">
                                    <span className="px-1.5 py-0.5 rounded bg-card border border-border/50 text-[8px]">Enter</span>
                                    Navigate
                                </span>
                                <span className="flex items-center gap-2">
                                    <span className="px-1.5 py-0.5 rounded bg-card border border-border/50 text-[8px]">↑↓</span>
                                    Switch
                                </span>
                            </div>
                            <span>Spotlight v1.0</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
