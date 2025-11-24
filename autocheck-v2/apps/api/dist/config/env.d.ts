export declare const env: {
    NODE_ENV: "development" | "production" | "test";
    PORT: number;
    DATABASE_URL: string;
    JWT_ACCESS_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_ACCESS_EXPIRES_IN: string;
    JWT_REFRESH_EXPIRES_IN: string;
    BCRYPT_ROUNDS: number;
    WEB_ORIGIN: string;
    RATE_LIMIT_WINDOW_MS: number;
    RATE_LIMIT_MAX_REQUESTS: number;
    AUTH_RATE_LIMIT_MAX: number;
    LOG_LEVEL: "fatal" | "error" | "warn" | "info" | "debug" | "trace";
};
