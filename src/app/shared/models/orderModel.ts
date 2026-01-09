import { ProductResponse } from './productModel';
import { AddressResponse } from './addressModel';

export interface OrderModelResponse {
  salesOrderId: number;
  revisionNumber: number;
  orderDate: Date;
  dueDate: Date;
  shipDate?: Date;
  status: number;
  onlineOrderFlag: boolean;
  salesOrderNumber: string;
  purchaseOrderNumber?: string;
  accountNumber?: string;
  customerId: number;
  shipToAddressId?: number;
  billToAddressId?: number;
  shipToAddress?: AddressResponse;
  billToAddress?: AddressResponse;
  shipMethod: string;
  creditCardApprovalCode?: string;
  subTotal: number;
  taxAmt: number;
  freight: number;
  totalDue: number;
  comment?: string;
  salesOrderDetails: OrderDetailResponse[];
}

interface OrderDetailResponse {
  orderQty: number;
  productId: number;
  unitPrice: number;
  unitPriceDiscount: number;
  lineTotal: number;
  product: ProductResponse[];
}
