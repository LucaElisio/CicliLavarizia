export interface ProductResponse {
  productId: number;
  name: string;
  productNumber: number;
  color?: string;
  standardCost: number;
  listPrice: number;
  size?: string;
  weight?: number;
  thumbNailPhoto?: string;
  thumbnailPhotoFileName?: string;
  productCategoryId: number;
  productModelId?: number;
  productCategory: ProductCategoryResponse;
}

export interface ProductCategoryResponse {
  productCategoryId: number;
  name: string;
}

export interface ProductModelsResponse {
  productModelId: number;
  modelDescription: string;
  name: string;
}
