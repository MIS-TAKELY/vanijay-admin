export const typeDefs = `
  type User {
    id: String!
    email: String!
    name: String
    role: String
    roles: [String]
    isSeller: Boolean
    isBanned: Boolean
    lastProductAdded: String
    createdAt: String
  }

  type UsersResponse {
    items: [User]
    totalCount: Int
  }

  type SellerProfileSchema {
    id: String!
    shopName: String!
    email: String
    verificationStatus: String
    totalSales: Int
    isActive: Boolean
  }

  type UserDetails {
    sales: Int
    revenue: Float
    inCartCount: Int
    inWishlistCount: Int
    returnedCount: Int
  }

  type ProductWithOrders {
    id: String!
    name: String!
    price: Float
    stock: Int
    status: String
    category: String
    images: [String]
    metadata: String
    orders: [OrderInfo]
  }

  type OrderInfo {
    id: String!
    orderNumber: String!
    buyerName: String!
    quantity: Int
    totalPrice: Float
    createdAt: String
  }

  type Product {
    id: String!
    name: String!
    brand: String
    description: String
    price: Float
    stock: Int
    status: String
    category: String
    sellerName: String
    updatedAt: String
    pros: [String]
    cons: [String]
    affiliateLink: String
    variants: [ProductVariant]
    images: [ProductImage]
    specificationTable: String # JSON string
    specificationDisplayFormat: String
    deliveryOptions: [DeliveryOption]
    warranty: [Warranty]
    returnPolicy: [ReturnPolicy]
  }

  type ProductsResponse {
    items: [Product]
    totalCount: Int
  }

  type ProductVariant {
    id: String!
    sku: String!
    price: Float!
    mrp: Float!
    stock: Int!
    soldCount: Int
    attributes: String # JSON string
    specificationTable: String # JSON string
    specifications: [Specification]
    isDefault: Boolean
    createdAt: String
  }

  type Specification {
    id: String!
    key: String!
    value: String!
  }

  type DeliveryOption {
    id: String!
    title: String!
    description: String
    isDefault: Boolean
  }

  type Warranty {
    id: String!
    type: String!
    duration: Int
    unit: String
    description: String
  }

  type ReturnPolicy {
    id: String!
    type: String!
    duration: Int
    unit: String
    conditions: String
  }

  type ProductImage {
    id: String!
    url: String!
    altText: String
    sortOrder: Int
    mediaType: String
    fileType: String
  }

  type Category {
      id: String!
      name: String!
      slug: String!
      description: String
      isActive: Boolean
      parentName: String
      parentId: String
      templateType: String
      priceRanges: [Int]
      filters: String # JSON string
      seoTemplates: String # JSON string
  }

  type SeoPage {
    id: String!
    categoryId: String!
    category: Category
    priceThreshold: Int!
    urlPath: String!
    metaTitle: String
    metaDescription: String
    structuredData: String # JSON string
    lastGeneratedAt: String
    isIndexed: Boolean!
    isStale: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Offer {
      id: String!
      title: String!
      type: String
      value: Float
      isActive: Boolean
      startDate: String
      endDate: String
  }

    totalUsers: Int
    totalOrders: Int
    totalSales: Float
  }

  type SeoAnalytics {
    totalPageCount: Int!
    stalePageCount: Int!
    indexedPageCount: Int!
    categoryStats: [SeoCategoryStats!]!
  }

  type SeoCategoryStats {
    categoryId: String!
    categoryName: String!
    pageCount: Int!
    staleCount: Int!
  }

  type BuyerDetails {
      profile: UserProfileInfo
      cartItems: [CartItemInfo]
      wishlistItems: [WishlistItemInfo]
      orders: [BuyerOrderInfo]
      cancelledOrders: [CancelledOrderInfo]
  }

  type UserProfileInfo {
      id: String!
      name: String
      email: String
      username: String
      phone: String
      avatarImageUrl: String
      addresses: [AddressInfo]
      createdAt: String
  }

  type AddressInfo {
      id: String!
      type: String
      line1: String
      line2: String
      city: String
      state: String
      country: String
      postalCode: String
      isDefault: Boolean
  }

  type CartItemInfo {
      id: String!
      productId: String!
      productName: String!
      productImage: String
      variantName: String
      price: Float
      quantity: Int
  }

  type WishlistItemInfo {
      id: String!
      productId: String!
      productName: String!
      productImage: String
      price: Float
  }

  type BuyerOrderInfo {
      id: String!
      orderNumber: String!
      status: String
      total: Float
      itemCount: Int
      createdAt: String
  }

  type CancelledOrderInfo {
      id: String!
      orderNumber: String!
      productName: String
      reason: String
      description: String
      createdAt: String
  }

  type SellerFullDetails {
      profile: SellerStoreInfo
      orders: [SellerOrderInfo]
      payouts: [PayoutInfo]
  }

  type SellerStoreInfo {
      id: String!
      shopName: String
      slug: String
      logo: String
      banner: String
      description: String
      tagline: String
      businessName: String
      businessRegNo: String
      businessType: String
      phone: String
      altPhone: String
      email: String
      returnPolicy: String
      shippingPolicy: String
      about: String
      verificationStatus: String
      isActive: Boolean
      averageRating: Float
      totalReviews: Int
      totalSales: Int
      createdAt: String
  }

  type SellerOrderInfo {
      id: String!
      orderNumber: String!
      status: String
      total: Float
      subtotal: Float
      tax: Float
      shippingFee: Float
      commission: Float
      createdAt: String
      buyerName: String
      items: [SellerOrderItemInfo]
  }

  type SellerOrderItemInfo {
      id: String!
      productName: String
      variantName: String
      quantity: Int
      unitPrice: Float
      totalPrice: Float
  }

  type PayoutInfo {
      id: String!
      amount: Float
      currency: String
      status: String
      scheduledFor: String
      processedAt: String
      createdAt: String
  }

  input UpdateProductInput {
    name: String
    brand: String
    description: String
    categoryId: String
    status: String
    specificationTable: String
    specificationDisplayFormat: String
    variants: [UpdateProductVariantInput]
    images: [UpdateProductImageInput]
    deliveryOptions: [UpdateDeliveryOptionInput]
    warranty: [UpdateWarrantyInput]
    returnPolicy: [UpdateReturnPolicyInput]
    pros: [String]
    cons: [String]
    affiliateLink: String
  }

  input UpdateProductVariantInput {
    id: String
    sku: String
    price: Float
    mrp: Float
    stock: Int
    isDefault: Boolean
    attributes: String # JSON string
    specificationTable: String # JSON string
  }

  input UpdateProductImageInput {
    url: String!
    altText: String
    sortOrder: Int
    mediaType: String
    fileType: String
  }

  input UpdateDeliveryOptionInput {
    title: String!
    description: String
    isDefault: Boolean
  }

  input UpdateWarrantyInput {
    type: String!
    duration: Int
    unit: String
    description: String
  }

  input UpdateReturnPolicyInput {
    type: String!
    duration: Int
    unit: String
    conditions: String
  }

  input CreateCategoryInput {
    name: String!
    slug: String!
    description: String
    parentId: String
    isActive: Boolean
    templateType: String
    priceRanges: [Int]
    filters: String # JSON string
    seoTemplates: String # JSON string
  }

  input CategoryTreeInput {
    name: String!
    slug: String!
    parentId: String
    description: String
    isActive: Boolean
    templateType: String
    priceRanges: [Int]
    filters: String # JSON string
    seoTemplates: String # JSON string
    children: [CategoryTreeInput]
  }

  input UpdateCategoryInput {
    name: String
    slug: String
    description: String
    parentId: String
    isActive: Boolean
    templateType: String
    priceRanges: [Int]
    filters: String # JSON string
    seoTemplates: String # JSON string
  }

  type Query {
    hello: String
    user(id: String!): User
    users(take: Int, skip: Int, search: String, role: String, isBanned: Boolean, sortBy: String): UsersResponse
    buyerDetails(userId: String!): BuyerDetails
    sellerFullDetails(userId: String!): SellerFullDetails
    productWithOrders(productId: String!): ProductWithOrders
    sellers(take: Int, skip: Int): [SellerProfileSchema]
    products(take: Int, skip: Int): ProductsResponse
    product(id: String!): Product
    sellerProducts(sellerId: String!, take: Int, skip: Int): [Product]
    userDetails(userId: String!): UserDetails
    categories(search: String): [Category]
    offers: [Offer]
    dashboardStats: DashboardStats
    getLandingPageCategoryCards: [LandingPageCategoryCard!]!
    getLandingPageCategorySwipers: [LandingPageCategorySwiper!]!
    getLandingPageProductGrids: [LandingPageProductGrid!]!
    getLandingPageBanners: [LandingPageBanner!]!
    seoPages: [SeoPage]
    seoAnalytics: SeoAnalytics
  }

  type BulkDeleteResult {
    success: Boolean!
    deletedCount: Int!
    message: String
  }

  type Mutation {
    loginAdmin(email: String!): String
    banUser(userId: String!): User
    unbanUser(userId: String!): User
    bulkBanUsers(userIds: [String!]!): [User]
    bulkUnbanUsers(userIds: [String!]!): [User]
    deleteUser(userId: String!): Boolean!
    hardDeleteUser(userId: String!): Boolean!
    bulkDeleteUsers(userIds: [String!]!, force: Boolean): BulkDeleteResult!
    updateProduct(id: String!, input: UpdateProductInput!): Product
    createCategory(input: CreateCategoryInput!): Category
    createCategoryTree(input: [CategoryTreeInput!]!): [Category]
    updateCategory(id: String!, input: UpdateCategoryInput!): Category
    deleteCategory(id: String!, force: Boolean): Boolean!
    createCategoryCard(input: CategoryCardInput!): LandingPageCategoryCard!
    updateCategoryCard(id: String!, input: CategoryCardInput!): LandingPageCategoryCard!
    deleteCategoryCard(id: String!): Boolean!
    createCategorySwiper(input: CategorySwiperInput!): LandingPageCategorySwiper!
    updateCategorySwiper(id: String!, input: CategorySwiperInput!): LandingPageCategorySwiper!
    deleteCategorySwiper(id: String!): Boolean!
    createProductGrid(input: ProductGridInput!): LandingPageProductGrid!
    updateProductGrid(id: String!, input: ProductGridInput!): LandingPageProductGrid!
    deleteProductGrid(id: String!): Boolean!
    createLandingPageBanner(input: CreateBannerInput!): LandingPageBannerPayload!
    updateLandingPageBanner(id: String!, input: CreateBannerInput!): LandingPageBannerPayload!
    deleteLandingPageBanner(id: String!): LandingPageBannerPayload!
    reorderLandingPageBanners(ids: [String!]!): LandingPageBannerPayload!
    bulkUpdateCategories(input: [BulkUpdateCategoryInput!]!): [Category]
    bulkDeleteCategories(ids: [String!]!, force: Boolean): Boolean!
    bulkCreateProducts(input: [BulkCreateProductInput!]!): [Product]
    generateSeoPages(categoryIds: [String!]): [SeoPage]
    regenerateSeoPage(id: String!): SeoPage
    deleteSeoPage(id: String!): Boolean!
  }

  input BulkUpdateCategoryInput {
    id: String!
    name: String
    slug: String
    description: String
    parentId: String
    isActive: Boolean
    templateType: String
    priceRanges: [Int]
    filters: String # JSON string
    seoTemplates: String # JSON string
  }

  # Landing Page Content Management Types
  
  type LandingPageCategoryCard {
    id: String!
    categoryId: String!
    categoryName: String
    image: String
    count: String
    color: String!
    darkColor: String
    sortOrder: Int!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type LandingPageCategorySwiper {
    id: String!
    title: String!
    category: String!
    sortOrder: Int!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type LandingPageProductGrid {
    id: String!
    title: String!
    topDealAbout: String!
    productIds: [String!]
    sortOrder: Int!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  input CategoryCardInput {
    categoryId: String!
    image: String
    color: String!
    darkColor: String
    sortOrder: Int
    isActive: Boolean
  }

  input CategorySwiperInput {
    title: String!
    category: String!
    sortOrder: Int
    isActive: Boolean
  }

  input ProductGridInput {
    title: String!
    topDealAbout: String!
    productIds: [String!]
    sortOrder: Int
    isActive: Boolean
  }

  type LandingPageBanner {
    id: String!
    title: String!
    description: String
    imageUrl: String!
    link: String
    sortOrder: Int!
    isActive: Boolean!
    mediaType: String
    createdAt: String!
    updatedAt: String!
  }

  type LandingPageBannerPayload {
    success: Boolean!
    message: String
    banner: LandingPageBanner
  }

  input CreateBannerInput {
    title: String!
    description: String
    imageUrl: String!
    link: String
    sortOrder: Int!
    isActive: Boolean!
    mediaType: String
  }

  input BulkCreateProductInput {
    name: String!
    description: String
    brand: String
    categoryName: String
    categoryId: String
    price: Int!
    mrp: Int
    stock: Int!
    sku: String!
    pros: [String]
    cons: [String]
    affiliateLink: String
    status: String
    sellerId: String
  }
`;
