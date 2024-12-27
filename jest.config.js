/** @type {import('jest').Config} */
export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    extensionsToTreatAsEsm: ['.ts'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        // Handle both .js and non-.js imports for testing
        '^(\\.{1,2}/.*)\\.js$': '$1',
        '^(\\.{1,2}/.*?)$': '$1'
    },
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                useESM: true,
                tsconfig: 'tsconfig.json'
            }
        ]
    }
};