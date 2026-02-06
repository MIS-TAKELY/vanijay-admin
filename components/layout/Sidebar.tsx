'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, ShoppingBag, Settings, Store, Globe, Container, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from "@/components/ui/scroll-area";
import { ModeToggle } from "@/components/ui/mode-toggle";

const navItems = [
    { href: '/', label: 'Overview', icon: LayoutDashboard },
    { href: '/users', label: 'Users', icon: Users },
    // { href: '/sellers', label: 'Sellers', icon: Store },
    { href: '/products', label: 'Products', icon: ShoppingBag },
    { href: '/category', label: 'Category', icon: Globe },
    { href: '/content', label: 'Content', icon: Container },
    { href: '/content/popular-searches', label: 'Popular Searches', icon: Globe },
    { href: '/legal/terms-conditions', label: 'Legal', icon: Shield },
    { href: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className, ...props }: SidebarProps) {
    const pathname = usePathname();

    return (
        <div className={cn("flex h-full w-64 flex-col border-r bg-card text-card-foreground", className)} {...props}>
            <div className="flex h-16 items-center border-b px-6">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                    <Store className="h-6 w-6" />
                    <span>Vanijay Admin</span>
                </Link>
            </div>
            <ScrollArea className="flex-1 py-4">
                <nav className="grid gap-1 px-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:text-foreground",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-accent"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </ScrollArea>
            <div className="p-4 border-t mt-auto flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Appearance</span>
                <ModeToggle />
            </div>
        </div>
    );
}
