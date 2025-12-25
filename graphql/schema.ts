export const typeDefs = `
  type User {
    id: String!
    email: String!
    name: String
    role: String
    isSeller: Boolean
    createdAt: String
  }

  type SellerProfile {
    id: String!
    shopName: String!
    email: String
    verificationStatus: String
    totalSales: Int
    isActive: Boolean
  }

  type Product {
    id: String!
    name: String!
    price: Float
    stock: Int
    status: String
    category: String
    sellerName: String
  }

  type Category {
      id: String!
      name: String!
      slug: String!
      description: String
      isActive: Boolean
      parentName: String
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

  type DashboardStats {
    totalUsers: Int
    totalOrders: Int
    totalSales: Float
  }

  type Query {
    hello: String
    users(take: Int, skip: Int): [User]
    sellers(take: Int, skip: Int): [SellerProfile]
    products(take: Int, skip: Int): [Product]
    categories: [Category]
    offers: [Offer]
    dashboardStats: DashboardStats
  }

  type Mutation {
    loginAdmin(email: String!): String
  }
`;
