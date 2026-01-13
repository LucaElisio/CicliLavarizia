export interface ProductResponse {
    productId: number,
    name: string,
    productNumber: string
    color?: string,
    standardCost: number,
    listPrice: number,
    size?: string,
    weight?: number,
    thumbNailPhoto?: string,
    thumbnailPhotoFileName?: string,
    productCategoryId: number,
    productModelId?: number,
    sellStartDate: string
    productCategory: ProductCategoryResponse
}

export interface ProductCategoryResponse {
    productCategoryId: number,
    name: string,
}