"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    preset: "ts-jest",
    testEnvironment: "node",
    modulePaths: ["<rootDir>/tests/"],
    testPathIgnorePatterns: ["dist"],
    // setupFilesAfterEnv: ["<rootDir>/jestFilesAfterEnv.ts"],
};
