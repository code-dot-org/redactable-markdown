module.exports = {
  root: true,

  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2017,
    ecmaFeatures: {
      modules: true,
      experimentalObjectRestSpread: true,
    },
  },

  extends: ["eslint:recommended", "plugin:prettier/recommended"],

  env: {
    browser: true,
    es6: true,
    jest: true,
    node: true,
  },
};
