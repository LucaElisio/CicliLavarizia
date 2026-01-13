export interface SalesOrderHeader {
    salesOrderId: number;
    revisionNumber: number;
    orderDate: string;
    dueDate: string;
    shipDate?: string;
    status: number;
    onlineOrderFlag: boolean;
    salesOrderNumber: string;
    purchaseOrderNumber?: string;
    accountNumber?: string;
    customerId: number;
    shipToAddressID: number;
    billToAddressID: number;
    shipMethod: string;
    creditCardApprovalCode?: string;
    subTotal: number;
    taxAmt: number;
    freight: number;
    totalDue: number;
    comment?: string;
    modifiedDate: string;
}
