export interface CustomerInfoRequest {
  customerId: number;
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  companyName: string;
  salesPerson: string;
  phone: string;
  role: Role;
  customerAddresses: CustomerAddress[];
}

interface CustomerAddress {
  customerId: number;
  addressId: number;
  addressType: string;
  address: Address;
}

interface Address {
  addressId: number;
  addressLine1: string;
  city: string;
  stateProvince: string;
  countryRegion: string;
  postalCode: string;
}

export interface CustomerUpdateRequest {
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  companyName: string;
  salesPerson: string;
  phone: string;
}

export enum Role {
  Admin = "Admin",
  Customer = "Customer",
  SaleAssistant = "SaleAssistant",
  Logistic = "Logistic"
}
