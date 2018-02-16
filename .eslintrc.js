module.exports = {
  "parser": "babel-eslint",

  "parserOptions": {
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true,
      "modules": true,
      "ecmaVersion": 6,
      "experimentalObjectRestSpread": true
    }
  },

  "plugins": [
    "react",
    "babel",
  ],
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended"
  ],

  "env": {
    "browser": true,
    "es6": true,
    "jest": true
  },
};
