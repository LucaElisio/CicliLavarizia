export interface LoginRequest {
    emailAddress: string;
    password: string;
}

export interface RegisterRequest {
    firstName: string,
    lastName: string,
    emailAddress: string,
    password: string,
    confirmPassword: string,
}