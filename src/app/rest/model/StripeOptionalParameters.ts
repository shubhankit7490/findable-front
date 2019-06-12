import { PaymentObject } from './PaymentObject';

export interface StipeOptionalParameters extends PaymentObject {
 currency?: string;
}
