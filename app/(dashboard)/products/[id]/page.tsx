import { gql } from '@apollo/client';
import { getServerClient } from '@/lib/apollo-server';
import AdminProductDetail from '@/components/page/product/AdminProductDetail';

export const dynamic = 'force-dynamic';

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
      parentId
      isActive
    }
  }
`;

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = getServerClient();

  let productData, categoriesData;
  try {
    const [productResult, categoriesResult] = await Promise.all([
      client.query({
        query: GET_PRODUCT,
        variables: { id },
        fetchPolicy: 'no-cache',
      }),
      client.query({
        query: GET_CATEGORIES,
        fetchPolicy: 'no-cache',
      }),
    ]);
    productData = productResult.data;
    categoriesData = categoriesResult.data;
  } catch (error: any) {
    console.error('Failed to fetch data:', error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Error Loading Product</h2>
          <p className="text-muted-foreground">{error.message || 'Failed to load product data'}</p>
        </div>
      </div>
    );
  }

  const product = productData?.product;
  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Product not found</h2>
          <p className="text-muted-foreground">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <AdminProductDetail
      product={JSON.parse(JSON.stringify(product))}
      categories={JSON.parse(JSON.stringify(categoriesData?.categories || []))}
    />
  );
}
