"use client";

import { useQuery, useMutation } from "@apollo/client";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import {
    GET_LANDING_PAGE_CATEGORY_CARDS,
    GET_LANDING_PAGE_CATEGORY_SWIPERS,
    GET_LANDING_PAGE_PRODUCT_GRIDS,
    GET_CATEGORIES,
} from "@/graphql/landing-page.queries";
import { GET_LANDING_PAGE_BANNERS } from "@/graphql/landing-page-banner.queries";
import CategoryCardsManager from "@/components/content/CategoryCardsManager";
import CategorySwipersManager from "@/components/content/CategorySwipersManager";
import ProductGridsManager from "@/components/content/ProductGridsManager";
import BannerManager from "@/components/content/BannerManager";

export default function ContentManagementPage() {
    const [activeTab, setActiveTab] = useState("hero-banners");

    const {
        data: bannersData,
        loading: bannersLoading,
        refetch: refetchBanners,
    } = useQuery(GET_LANDING_PAGE_BANNERS);

    const {
        data: categoryCardsData,
        loading: cardsLoading,
        refetch: refetchCards,
    } = useQuery(GET_LANDING_PAGE_CATEGORY_CARDS);

    const {
        data: categorySwipersData,
        loading: swipersLoading,
        refetch: refetchSwipers,
    } = useQuery(GET_LANDING_PAGE_CATEGORY_SWIPERS);

    const {
        data: productGridsData,
        loading: gridsLoading,
        refetch: refetchGrids,
    } = useQuery(GET_LANDING_PAGE_PRODUCT_GRIDS);

    const { data: categoriesData } = useQuery(GET_CATEGORIES);
    const categories = categoriesData?.categories || [];

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Landing Page Content</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage the content displayed on the buyer-facing landing page
                    </p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="hero-banners">Hero Banners</TabsTrigger>
                    <TabsTrigger value="category-cards">Category Cards</TabsTrigger>
                    <TabsTrigger value="category-swipers">Category Swipers</TabsTrigger>
                    <TabsTrigger value="product-grids">Product Grids</TabsTrigger>
                </TabsList>

                <TabsContent value="hero-banners" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Hero Banners</CardTitle>
                            <CardDescription>
                                Manage the main carousel banners on the homepage
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {bannersLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <BannerManager
                                    banners={bannersData?.getLandingPageBanners || []}
                                    categories={categories}
                                    refetch={refetchBanners}
                                />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="category-cards" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Category Cards</CardTitle>
                            <CardDescription>
                                Manage the category cards displayed at the top of the homepage
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {cardsLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <CategoryCardsManager
                                    cards={categoryCardsData?.getLandingPageCategoryCards || []}
                                    refetch={refetchCards}
                                />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="category-swipers" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Category Swiper Sections</CardTitle>
                            <CardDescription>
                                Manage horizontal scrolling product sections by category
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {swipersLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <CategorySwipersManager
                                    swipers={categorySwipersData?.getLandingPageCategorySwipers || []}
                                    refetch={refetchSwipers}
                                    categories={categories}
                                />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="product-grids" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Grid Sections</CardTitle>
                            <CardDescription>
                                Manage grid layout product sections with custom filters
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {gridsLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <ProductGridsManager
                                    grids={productGridsData?.getLandingPageProductGrids || []}
                                    refetch={refetchGrids}
                                    categories={categories}
                                />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
