import { gql } from '@apollo/client';

export const GET_LANDING_PAGE_CATEGORY_CARDS = gql`
  query GetLandingPageCategoryCards {
    getLandingPageCategoryCards {
      id
      categoryId
      categoryName
      image
      count
      color
      darkColor
      sortOrder
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const GET_LANDING_PAGE_CATEGORY_SWIPERS = gql`
  query GetLandingPageCategorySwipers {
    getLandingPageCategorySwipers {
      id
      title
      category
      sortOrder
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const GET_LANDING_PAGE_PRODUCT_GRIDS = gql`
  query GetLandingPageProductGrids {
    getLandingPageProductGrids {
      id
      title
      topDealAbout
      productIds
      sortOrder
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_CATEGORY_CARD = gql`
  mutation CreateCategoryCard($input: CategoryCardInput!) {
    createCategoryCard(input: $input) {
      id
      categoryId
      categoryName
      image
      count
      color
      darkColor
      sortOrder
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_CATEGORY_CARD = gql`
  mutation UpdateCategoryCard($id: String!, $input: CategoryCardInput!) {
    updateCategoryCard(id: $id, input: $input) {
      id
      categoryId
      categoryName
      image
      count
      color
      darkColor
      sortOrder
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_CATEGORY_CARD = gql`
  mutation DeleteCategoryCard($id: String!) {
    deleteCategoryCard(id: $id)
  }
`;

export const CREATE_CATEGORY_SWIPER = gql`
  mutation CreateCategorySwiper($input: CategorySwiperInput!) {
    createCategorySwiper(input: $input) {
      id
      title
      category
      sortOrder
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_CATEGORY_SWIPER = gql`
  mutation UpdateCategorySwiper($id: String!, $input: CategorySwiperInput!) {
    updateCategorySwiper(id: $id, input: $input) {
      id
      title
      category
      sortOrder
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_CATEGORY_SWIPER = gql`
  mutation DeleteCategorySwiper($id: String!) {
    deleteCategorySwiper(id: $id)
  }
`;

export const CREATE_PRODUCT_GRID = gql`
  mutation CreateProductGrid($input: ProductGridInput!) {
    createProductGrid(input: $input) {
      id
      title
      topDealAbout
      productIds
      sortOrder
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_PRODUCT_GRID = gql`
  mutation UpdateProductGrid($id: String!, $input: ProductGridInput!) {
    updateProductGrid(id: $id, input: $input) {
      id
      title
      topDealAbout
      productIds
      sortOrder
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_PRODUCT_GRID = gql`
  mutation DeleteProductGrid($id: String!) {
    deleteLandingPageProductGrid(id: $id)
  }
`;

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      slug
      description
      parentId
      isActive
    }
  }
`;
