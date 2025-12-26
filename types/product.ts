// Re-export from pages/product for backward compatibility
export * from "./pages/product";

// Additional types needed by components
export interface IDeliveryOption {
    description: string;
    title: string;
}
