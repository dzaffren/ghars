module.exports = {
  "*.{ts,tsx}": () => "tsc --noEmit",
  "*.{ts,tsx,css}": "prettier --write",
};
