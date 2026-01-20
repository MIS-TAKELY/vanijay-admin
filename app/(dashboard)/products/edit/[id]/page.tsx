import { gql } from "@apollo/client";
import EditProductClient from "@/components/product/EditProductClient";
import { getServerClient } from "@/lib/apollo-server";

export const dynamic = "force-dynamic";

const GET_PRODUCT = gql`
  query GetProduct($id: String!) {
    product(id: $id) {
      id
      name
      brand
      description
      price
      stock
      status
      category
      sellerName
      createdAt
      updatedAt
      specificationTable
      images {
        id
        url
        altText
        mediaType
        fileType
        sortOrder
      }
      variants {
        id
        sku
        price
        mrp
        stock
        soldCount
        attributes
        specificationTable
        specifications {
          id
          key
          value
        }
        isDefault
        createdAt
      }
      deliveryOptions {
        id
        title
        description
        isDefault
      }
      warranty {
        id
        type
        duration
        unit
        description
      }
      returnPolicy {
        id
        type
        duration
        unit
        conditions
      }
    }
  }
`;

const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      slug
      description
      parentId
      parentName
      isActive
    }
  }
`;

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: productId } = await params;
  const client = getServerClient();

  let productData;
  let categoryData;

  try {
    const [productQuery, categoryQuery] = await Promise.all([
      client.query({
        query: GET_PRODUCT,
        variables: { id: productId },
        fetchPolicy: "no-cache",
      }),
      client.query({
        query: GET_CATEGORIES,
        fetchPolicy: "cache-first",
      }),
    ]);

    productData = productQuery.data;
    categoryData = categoryQuery.data;
  } catch (error: any) {
    console.error("Failed to fetch product data:", error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Error Loading Product</h2>
          <p className="text-muted-foreground">
            {error.message || "Failed to load product data"}
          </p>
        </div>
      </div>
    );
  }

  if (!productData?.product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Product not found</h2>
          <p className="text-muted-foreground">
            The product you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <EditProductClient
      product={JSON.parse(JSON.stringify(productData.product))}
      categories={JSON.parse(JSON.stringify(categoryData?.categories || []))}
    />
  );
}
