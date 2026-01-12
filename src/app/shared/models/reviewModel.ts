export interface ReviewRequest {
  productId: number;
  customerId: number;
  rating: number;
  reviewText: string;
}

export interface ReviewResponse {
  _id: number;
  productId: number;
  customerId: number;
  rating: number;
  reviewText: string;
  reviewDate: string;
}