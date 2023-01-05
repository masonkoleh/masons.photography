module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "overrides": [
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "rules": {
		"dot-location": ["error", "property"],
		"semi": ["error", "always"],
		"semi-style": ["error", "last"],
		"no-extra-semi": ["error"],
		"semi-spacing": ["error"],
		"func-call-spacing": ["error", "never"],
		"dot-notation": "error"
    }
};
