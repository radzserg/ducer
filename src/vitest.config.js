"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("vitest/config");
exports.default = (0, config_1.defineConfig)({
    plugins: [],
    resolve: {},
    test: {
        cache: false,
        environment: 'node',
        include: ['./src/**/*.test.ts'],
        isolate: false,
        mockReset: true,
        pool: 'forks',
        poolOptions: {
            forks: {
                maxForks: 10,
                minForks: 1,
            },
        },
        reporters: ['verbose'],
        testTimeout: 120_000,
    },
});
