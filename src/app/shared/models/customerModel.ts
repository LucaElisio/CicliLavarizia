export interface CustomerInfoRequest {
  customerId: number;
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  companyName: string;
  salesPerson: string;
  phone: string;
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
