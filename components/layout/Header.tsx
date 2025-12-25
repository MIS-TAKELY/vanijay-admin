"use client"

import { ThemeToggle } from "./ThemeToggle";
import { Sidebar } from "./Sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function Header() {
    const { data: session } = useSession();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/login"); // Redirect to login after sign out
                },
            },
        });
    };

    const user = session?.user;
    const initials = user?.name
        ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "AD";

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            {/* Mobile Sidebar Trigger */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 border-r w-72">
                    <Sidebar className="w-full border-none" />
                </SheetContent>
            </Sheet>

            <div className="flex-1">
                <h1 className="text-lg font-semibold text-foreground">Overview</h1>
            </div>

            <div className="flex items-center gap-4">
                <ThemeToggle />
                <Separator orientation="vertical" className="h-6" />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={user?.image || (user as any)?.avatarImageUrl || ""} alt={user?.name || "Admin"} />
                                <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user?.name || "Admin"}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user?.email || "admin@vanijay.com"}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleSignOut}>Log out</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
