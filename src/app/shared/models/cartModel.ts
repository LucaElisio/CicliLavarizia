import { ProductResponse } from './productModel';

export interface CartResponse {
  products: ProductResponse[];
  totalElements: number;
  totalAmount: number;
}
