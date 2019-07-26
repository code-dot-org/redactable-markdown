module.exports = {
  "root": true,

  "parserOptions": {
    "sourceType": "module",
    "ecmaFeatures": {
      "modules": true,
      "ecmaVersion": 6,
      "experimentalObjectRestSpread": true
    }
  },

  "extends": [
    "eslint:recommended",
    "plugin:prettier/recommended"
  ],

  "env": {
    "browser": true,
    "es6": true,
    "jest": true,
    "node": true,
  },
};
