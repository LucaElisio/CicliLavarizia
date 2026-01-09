export interface ProductDiscount {
    productDiscountId: number;
    code: string;
    percentage: number;
    startDate: string;
    endDate: string;
    productId: number[];
    productCategoryId: number[];
}
