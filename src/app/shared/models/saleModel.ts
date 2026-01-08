import { AddressResponse } from "./addressModel"

export interface SaleResponse {
  shipMethod: string,
  creditCardApprovalCode: string,
  comment: string,
  shipType: boolean,
  shipToAddress: AddressResponse,
  billToAddress: AddressResponse,
  discountCode: string
}