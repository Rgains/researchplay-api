import { hashSync } from "bcryptjs"
import { currentConfig } from "./config"

export function hasher(password: string): string {
    const hashed_password = hashSync(password, currentConfig.salt);

    return hashed_password;
}