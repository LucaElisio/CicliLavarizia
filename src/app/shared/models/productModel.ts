export interface ProductResponse {
    productId: number,
    name: string,
    productNumber: number
    color?: string,
    standardCost: number,
    listPrice: number,
    size?: string,
    weight?: number,
    productCategoryId: number,
    productModelId?: number,
    productCategory: ProductCategoryResponse
}

export interface ProductCategoryResponse {
    productCategoryId: number,
    name: string,
}