"use client";

import { useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProductForm } from "@/components/product/ProductForm";
import { transformProductToFormData } from "@/utils/product/transformProductData";
import { buildProductInput } from "@/utils/product/validateSteps";
import { ProductStatus } from "@/types/common/enums";
import { gql } from "@apollo/client";

const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: String!, $input: UpdateProductInput!) {
    updateProduct(id: $id, input: $input) {
      id
      name
      status
    }
  }
`;

export default function EditProductClient({ product, categories }: any) {
    const router = useRouter();

    const [updateProduct, { loading: isSubmitting }] = useMutation(UPDATE_PRODUCT, {
        onCompleted: () => {
            toast.success("Product updated successfully!");
            router.push(`/products/${product.id}`);
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update product");
        },
    });

    const initialValues = transformProductToFormData(product);

    const handleSubmit = async (input: any, status: ProductStatus) => {
        try {
            await updateProduct({
                variables: {
                    id: product.id,
                    input: {
                        name: input.name,
                        brand: input.brand,
                        description: input.description,
                        categoryId: input.categoryId,
                        status: input.status,
                        specificationTable: input.specificationTable ? JSON.stringify(input.specificationTable) : undefined,
                        variants: input.variants?.map((v: any) => ({
                            id: v.id,
                            sku: v.sku,
                            price: v.price,
                            mrp: v.mrp,
                            stock: v.stock,
                            isDefault: v.isDefault,
                            attributes: v.attributes ? JSON.stringify(v.attributes) : undefined,
                            specificationTable: v.specificationTable ? JSON.stringify(v.specificationTable) : undefined,
                        })),
                        images: input.images?.map((img: any, index: number) => ({
                            url: img.url,
                            altText: img.altText || "",
                            mediaType: img.mediaType,
                            fileType: img.fileType,
                            sortOrder: index,
                        })),
                        deliveryOptions: input.deliveryOptions?.map((opt: any) => ({
                            title: opt.title,
                            description: opt.description,
                            isDefault: opt.isDefault,
                        })),
                        warranty: input.warranty?.map((w: any) => ({
                            type: w.type,
                            duration: w.duration,
                            unit: w.unit,
                            description: w.description,
                        })),
                        returnPolicy: input.returnPolicy?.map((rp: any) => ({
                            type: rp.type,
                            duration: rp.duration,
                            unit: rp.unit,
                            conditions: rp.conditions,
                        })),
                    },
                },
            });
        } catch (error) {
            console.error("Update error:", error);
            throw error;
        }
    };

    return (
        <div className="space-y-10 pb-10">
            <ProductForm
                mode="edit"
                categoriesData={categories}
                initialValues={initialValues}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                title="Edit Product"
                subtitle="Update product information and settings."
            />
        </div>
    );
}
