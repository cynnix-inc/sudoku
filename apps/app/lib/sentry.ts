import React from "react";
import * as Sentry from "@sentry/react-native";

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

export const SENTRY_ENABLED = typeof dsn === "string" && dsn.length > 0;

export function initSentry(): void {
    if (!SENTRY_ENABLED) return;
    if (Sentry.getCurrentHub().getClient()) return;
    Sentry.init({
        dsn,
        tracesSampleRate: Number(process.env.EXPO_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? 0),
        enableAutoSessionTracking: true,
        debug: process.env.EXPO_PUBLIC_SENTRY_DEBUG === "1",
    });
    const appEnv = process.env.EXPO_PUBLIC_APP_ENV ?? process.env.APP_ENV ?? "development";
    Sentry.setTag("app_env", appEnv);
}

export function withSentry<TProps>(Component: React.ComponentType<TProps>): React.ComponentType<TProps> {
    if (!SENTRY_ENABLED) {
        return Component;
    }
    initSentry();
    return Sentry.wrap(
        Component as unknown as React.ComponentType<Record<string, unknown>>
    ) as unknown as React.ComponentType<TProps>;
}

export const addBreadcrumb = (breadcrumb: Sentry.Breadcrumb): void => {
    if (!SENTRY_ENABLED) return;
    Sentry.addBreadcrumb(breadcrumb);
};

export const captureException = (error: unknown, context?: unknown): void => {
    if (!SENTRY_ENABLED) return;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    Sentry.captureException(error as any, context as any);
};

export const captureMessage = (message: string, context?: unknown): void => {
    if (!SENTRY_ENABLED) return;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    Sentry.captureMessage(message, context as any);
};


