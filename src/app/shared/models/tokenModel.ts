import { Role } from './customerModel';

export interface TokenResponse {
    token: string;
}

export interface TokenDecoded {
    email: string;
    role: Role;
}