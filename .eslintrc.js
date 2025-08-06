module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true,
        "node": true,
        "mocha": true
    },
    "extends": "eslint:recommended",
    "rules": {
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "semi": [
            "error",
            "always"
        ]
    },
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly",
        "MyError": "readonly",
        "global": "readonly",
        "__base": "readonly",
        "expect": "readonly",
        "jest": "readonly",
        "beforeAll": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 2020
    }
};