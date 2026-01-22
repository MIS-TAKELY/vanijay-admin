import { gql } from "@apollo/client";

export const GET_LANDING_PAGE_BANNERS = gql`
  query GetLandingPageBanners {
    getLandingPageBanners {
      id
      title
      description
      imageUrl
      link
      sortOrder
      isActive
      mediaType
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_LANDING_PAGE_BANNER = gql`
  mutation CreateLandingPageBanner($input: CreateBannerInput!) {
    createLandingPageBanner(input: $input) {
      success
      message
      banner {
        id
        title
        description
        imageUrl
        link
        sortOrder
        isActive
        mediaType
      }
    }
  }
`;

export const UPDATE_LANDING_PAGE_BANNER = gql`
  mutation UpdateLandingPageBanner($id: String!, $input: UpdateBannerInput!) {
    updateLandingPageBanner(id: $id, input: $input) {
      success
      message
      banner {
        id
        title
        description
        imageUrl
        link
        sortOrder
        isActive
        mediaType
      }
    }
  }
`;

export const DELETE_LANDING_PAGE_BANNER = gql`
  mutation DeleteLandingPageBanner($id: String!) {
    deleteLandingPageBanner(id: $id) {
      success
      message
    }
  }
`;

export const REORDER_LANDING_PAGE_BANNERS = gql`
  mutation ReorderLandingPageBanners($ids: [String!]!) {
    reorderLandingPageBanners(ids: $ids) {
      success
      message
    }
  }
`;
