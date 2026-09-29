export interface IPasswordHasher {
    hash(password: string): Promise<string>;
    compare(password: string, hashDB: string): Promise<boolean>;
}