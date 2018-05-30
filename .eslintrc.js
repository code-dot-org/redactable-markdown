module.exports = {
  "root": true,
  "parser": "babel-eslint",

  "parserOptions": {
    "sourceType": "module",
    "ecmaFeatures": {
      "modules": true,
      "ecmaVersion": 6,
      "experimentalObjectRestSpread": true
    }
  },

  "plugins": [
    "babel",
  ],
  "extends": [
    "eslint:recommended",
  ],

  "env": {
    "browser": true,
    "es6": true,
    "jest": true,
    "node": true,
  },
};
