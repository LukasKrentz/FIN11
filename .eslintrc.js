module.exports = {
    "env": {
        "node": true
    },    
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    "parser": "@typescript-eslint/parser",
    "plugins": ["@typescript-eslint"],
    "rules": {
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": ["error", { "varsIgnorePattern": "Command" }],
        "@typescript-eslint/no-explicit-any": "error",
        "strict": [2, "global"],
        "no-undef": 0,
        "semi": [2, "always"],
    },
    "ignorePatterns": ["src/**/*.test.ts"]
};
