"use client";

import SmartMedia from "@/components/ui/SmartMedia";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  Download,
  Edit,
  ImageIcon,
  Info,
  Package,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import DeliveryInfo from "./DeliveryInfo";
import ImageZoomViewer from "./ImageZoomViewer";
import ProductGallery from "./ProductGallery";
import VariantSelector from "./VariantSelector";
import EditBasicInfoDialog from "./edit/EditBasicInfoDialog";
import EditDeliveryDialog from "./edit/EditDeliveryDialog";
import EditImagesDialog from "./edit/EditImagesDialog";
import EditSpecificationsDialog from "./edit/EditSpecificationsDialog";
import EditCategoryDialog from "./edit/EditCategoryDialog";

interface AdminProductDetailProps {
  product: any;
  categories?: any[];
}

export default function AdminProductDetail({
  product,
  categories = [],
}: AdminProductDetailProps) {
  const router = useRouter();
  const [imageHoverData, setImageHoverData] = useState({
    isHovering: false,
    imageUrl: "",
    position: { x: 50, y: 50 },
  });

  const [editImagesOpen, setEditImagesOpen] = useState(false);
  const [editBasicInfoOpen, setEditBasicInfoOpen] = useState(false);
  const [editSpecsOpen, setEditSpecsOpen] = useState(false);
  const [editDeliveryOpen, setEditDeliveryOpen] = useState(false);
  const [editCategoryOpen, setEditCategoryOpen] = useState(false);

  // Initialize selectedAttributes based on default variant
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (product?.variants?.length) {
      const defaultVar =
        product.variants.find((v: any) => v.isDefault) || product.variants[0];
      if (defaultVar?.attributes) {
        try {
          const attrs =
            typeof defaultVar.attributes === "string"
              ? JSON.parse(defaultVar.attributes)
              : defaultVar.attributes;
          setSelectedAttributes(attrs || {});
        } catch (e) {
          console.error("Error parsing attributes:", e);
        }
      }
    }
  }, [product]);

  // Find active variant based on selected attributes
  const activeVariant = useMemo(() => {
    if (!product?.variants?.length) return product?.variants?.[0];

    return (
      product.variants.find((v: any) => {
        if (!v.attributes) return false;
        const attrs =
          typeof v.attributes === "string"
            ? JSON.parse(v.attributes)
            : v.attributes;
        return Object.entries(selectedAttributes).every(
          ([key, value]) => attrs[key] === value
        );
      }) || product.variants[0]
    );
  }, [product?.variants, selectedAttributes]);

  const handleAttributeSelect = useCallback((key: string, value: string) => {
    setSelectedAttributes((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Parse specification sections
  const specSections = useMemo(() => {
    try {
      // 1. Try global specificationTable
      if (product.specificationTable) {
        const parsed =
          typeof product.specificationTable === "string"
            ? JSON.parse(product.specificationTable)
            : product.specificationTable;

        if (Array.isArray(parsed)) {
          // New Multi-Section format
          return parsed.filter(
            (section: any) =>
              section.rows &&
              Array.isArray(section.rows) &&
              section.rows.some((r: any) => r.some((c: any) => c && c.trim()))
          );
        } else if (
          parsed &&
          Array.isArray(parsed.rows) &&
          parsed.rows.filter((r: any) => r.some((c: any) => c && c.trim())).length >
          0
        ) {
          // Legacy Single Table format
          return [
            {
              title: "Technical Specifications",
              headers: parsed.headers || ["Attribute", "Value"],
              rows: parsed.rows,
            },
          ];
        }
      }

      // 2. Fallback to activeVariant.specifications
      if (activeVariant?.specifications?.length) {
        return [
          {
            title: "Technical Specifications",
            headers: ["Attribute", "Value"],
            rows: activeVariant.specifications.map((s: any) => [s.key, s.value]),
          },
        ];
      }

      // 3. Fallback to any variant's specifications if active variant has none
      const firstVarWithSpecs = product.variants?.find(
        (v: any) => v.specifications?.length > 0
      );
      if (firstVarWithSpecs?.specifications?.length) {
        return [
          {
            title: "Technical Specifications",
            headers: ["Attribute", "Value"],
            rows: firstVarWithSpecs.specifications.map((s: any) => [
              s.key,
              s.value,
            ]),
          },
        ];
      }

      return [];
    } catch {
      return [];
    }
  }, [product.specificationTable, product.variants, activeVariant]);

  // Get primary images
  const primaryImages =
    product.images?.filter((img: any) => img.mediaType === "PRIMARY") || [];

  // Get promotional images
  const promotionalImages =
    product.images?.filter((img: any) => img.mediaType === "PROMOTIONAL") || [];

  // Calculate pricing
  const price = parseFloat(activeVariant?.price || "0");
  const mrp = parseFloat(activeVariant?.mrp || "0");
  const hasDiscount = mrp > price;
  const discountPercent = hasDiscount
    ? Math.round(((mrp - price) / mrp) * 100)
    : 0;

  // Stock status
  const inStock = (activeVariant?.stock || 0) > 0;

  // Parse variants for selector
  const parsedVariants = useMemo(() => {
    return (
      product.variants?.map((v: any) => ({
        ...v,
        attributes:
          typeof v.attributes === "string"
            ? JSON.parse(v.attributes)
            : v.attributes,
      })) || []
    );
  }, [product.variants]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-2 px-4 rounded-full w-fit">
        <span>Admin</span>
        <ChevronRight className="w-3 h-3" />
        <span>Products</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-primary font-medium">{product.name}</span>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: Product Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex justify-end mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditImagesOpen(true)}
              className="gap-2 text-primary"
            >
              <Edit className="w-4 h-4" />
              Edit Images
            </Button>
          </div>
          <ProductGallery
            images={primaryImages}
            productName={product.name}
            onImageHover={(data) => setImageHoverData(data)}
          />

          {/* Image Zoom Viewer */}
          {imageHoverData.isHovering && (
            <ImageZoomViewer
              imageUrl={imageHoverData.imageUrl}
              position={imageHoverData.position}
              productName={product.name}
            />
          )}

          {/* Promotional Assets Section */}
          {promotionalImages.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2 text-primary">
                <ImageIcon className="w-5 h-5" />
                <h3 className="text-lg font-bold">Promotional Assets</h3>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {promotionalImages.map((img: any, idx: number) => (
                  <div
                    key={img.id || idx}
                    className="group relative aspect-video bg-muted/20 border rounded-xl overflow-hidden hover:shadow-md transition-all"
                  >
                    <SmartMedia
                      src={img.url}
                      alt={img.altText || `Promotional Image ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-7 px-2 gap-1 text-[10px] font-bold"
                        onClick={() => window.open(img.url, "_blank")}
                      >
                        <Download className="w-3 h-3" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Product Info */}
        <div className="lg:col-span-5 space-y-6">
          {/* Brand & Title */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge
                variant="outline"
                className="text-primary border-primary/20 bg-primary/5 uppercase tracking-wider text-[10px] font-bold"
              >
                {product.brand || "Generic"}
              </Badge>
              <Badge
                variant={product.status === "ACTIVE" ? "default" : "secondary"}
              >
                {product.status}
              </Badge>
            </div>

            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                {product.name}
              </h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditBasicInfoOpen(true)}
                className="text-muted-foreground hover:text-primary shrink-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>

            {product.description && (
              <p className="text-muted-foreground text-base leading-relaxed line-clamp-3">
                {product.description}
              </p>
            )}
          </div>

          {/* Price Display */}
          <div className="space-y-2 p-4 rounded-2xl bg-muted/30 border border-border/50">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-primary">
                रू {price.toLocaleString()}
              </span>
              {hasDiscount && (
                <div className="flex flex-col items-start leading-none gap-1">
                  <span className="text-sm text-muted-foreground line-through decoration-red-500/50">
                    रू {mrp.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-success">
                    {discountPercent}% OFF
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Prices inclusive of all taxes
            </p>
          </div>

          {/* Variant Selector */}
          {parsedVariants.length > 1 && (
            <VariantSelector
              variants={parsedVariants}
              selectedAttributes={selectedAttributes}
              onAttributeSelect={handleAttributeSelect}
            />
          )}

          <Separator />

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 border border-border/30">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="w-4 h-4 text-primary" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  SKU
                </p>
                <p className="text-[12px] font-medium leading-tight font-mono">
                  {activeVariant?.sku || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 border border-border/30">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-green-600" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Stock
                </p>
                <p className="text-[12px] font-medium leading-tight">
                  {activeVariant?.stock || 0} units
                </p>
              </div>
            </div>
          </div>

          {/* Stock Status */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/40 border border-dashed border-primary/30">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "h-2 w-2 rounded-full animate-pulse",
                  inStock ? "bg-green-500" : "bg-red-500"
                )}
              />
              <span className="text-sm font-bold">
                {inStock
                  ? `In Stock (${activeVariant?.stock})`
                  : "Out of Stock"}
              </span>
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              Sold:{" "}
              <span className="text-foreground">
                {activeVariant?.soldCount || 0}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <Card className="border-none shadow-lg overflow-hidden bg-background">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="w-full justify-start rounded-none h-14 bg-muted/30 border-b p-0">
            <TabsTrigger
              value="description"
              className="rounded-none h-full px-8 data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary text-sm font-bold uppercase tracking-wider"
            >
              Description
            </TabsTrigger>
            <TabsTrigger
              value="specifications"
              className="rounded-none h-full px-8 data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary text-sm font-bold uppercase tracking-wider"
            >
              Specifications
            </TabsTrigger>
            <TabsTrigger
              value="policies"
              className="rounded-none h-full px-8 data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary text-sm font-bold uppercase tracking-wider"
            >
              Policies
            </TabsTrigger>
          </TabsList>

          <CardContent className="p-8">
            <TabsContent value="description" className="m-0">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="flex items-center gap-2 mb-4 text-primary">
                  <Info className="w-5 h-5" />
                  <h3 className="text-lg font-bold">About this product</h3>
                </div>
                <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {product.description ||
                    "No description provided for this product."}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="specifications" className="m-0">
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-primary mb-4">
                  <Package className="w-5 h-5" />
                  <h3 className="text-lg font-bold">
                    Technical Specifications
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditSpecsOpen(true)}
                    className="ml-auto gap-2 text-primary"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Specs
                  </Button>
                </div>

                {specSections && specSections.length > 0 ? (
                  <div className="space-y-10">
                    {specSections.map((section: any, idx: number) => (
                      <div key={idx} className="space-y-4">
                        {section.title && (
                          <div className="flex items-center gap-3">
                            <div className="h-1 w-1 rounded-full bg-primary" />
                            <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                              {section.title}
                            </h4>
                          </div>
                        )}
                        <div className="border rounded-2xl overflow-hidden">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-muted/50 border-b">
                                {section.headers?.map(
                                  (header: string, i: number) => (
                                    <th
                                      key={i}
                                      className="px-4 py-3 font-semibold text-left text-muted-foreground border-r last:border-r-0"
                                    >
                                      {header}
                                    </th>
                                  )
                                )}
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {section.rows?.map(
                                (row: string[], i: number) => (
                                  <tr
                                    key={i}
                                    className={cn(
                                      "hover:bg-muted/30 transition-colors",
                                      i % 2 === 0
                                        ? "bg-background"
                                        : "bg-muted/10"
                                    )}
                                  >
                                    {row.map((cell, j) => (
                                      <td
                                        key={j}
                                        className="px-4 py-3 border-r last:border-r-0"
                                      >
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-12 italic bg-muted/10 rounded-2xl border border-dashed">
                    No technical specifications added.
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="policies" className="m-0">
              <div className="flex justify-end mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditDeliveryOpen(true)}
                  className="gap-2 text-primary"
                >
                  <Edit className="w-4 h-4" />
                  Edit Policies
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Delivery Options */}
                <div className="space-y-4 bg-muted/10 p-6 rounded-3xl border border-border/50">
                  <div className="flex items-center gap-3 text-primary">
                    <Truck className="w-6 h-6" />
                    <h4 className="font-bold">Shipping & Delivery</h4>
                  </div>
                  {product.deliveryOptions?.length > 0 ? (
                    <DeliveryInfo deliveryOptions={product.deliveryOptions} />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No delivery options configured
                    </p>
                  )}
                </div>

                {/* Warranty & Returns */}
                <div className="space-y-4 bg-muted/10 p-6 rounded-3xl border border-border/50">
                  <div className="flex items-center gap-3 text-primary">
                    <RotateCcw className="w-6 h-6" />
                    <h4 className="font-bold">Warranty & Returns</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                        Warranty
                      </p>
                      <p className="text-sm font-medium leading-relaxed">
                        {product.warranty?.[0]
                          ? `${product.warranty[0].duration} ${product.warranty[0].unit} ${product.warranty[0].type} warranty`
                          : "No warranty"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                        Return Policy
                      </p>
                      <p className="text-sm font-medium leading-relaxed">
                        {product.returnPolicy?.[0]
                          ? `${product.returnPolicy[0].duration} ${product.returnPolicy[0].unit} ${product.returnPolicy[0].type}`
                          : "No returns accepted"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* System Info (Admin Only) */}
      <Card className="border-dashed">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            System Information
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Product ID</p>
              <p className="font-mono font-medium">{product.id}</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">Category</p>
                <p className="font-medium">{product.category || "N/A"}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditCategoryOpen(true)}
                className="text-muted-foreground hover:text-primary h-8 w-8"
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>
            <div>
              <p className="text-muted-foreground">Seller</p>
              <p className="font-medium">{product.sellerName || "N/A"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Created</p>
              <p className="font-medium">
                {new Date(product.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialogs */}
      <EditImagesDialog
        product={product}
        open={editImagesOpen}
        onOpenChange={setEditImagesOpen}
        onSuccess={() => router.refresh()}
      />
      <EditBasicInfoDialog
        product={product}
        open={editBasicInfoOpen}
        onOpenChange={setEditBasicInfoOpen}
        onSuccess={() => router.refresh()}
      />
      <EditSpecificationsDialog
        product={product}
        open={editSpecsOpen}
        onOpenChange={setEditSpecsOpen}
        onSuccess={() => router.refresh()}
      />
      <EditDeliveryDialog
        product={product}
        open={editDeliveryOpen}
        onOpenChange={setEditDeliveryOpen}
        onSuccess={() => router.refresh()}
      />
      <EditCategoryDialog
        product={product}
        categories={categories}
        open={editCategoryOpen}
        onOpenChange={setEditCategoryOpen}
      />
    </div>
  );
}
