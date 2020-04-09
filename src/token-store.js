// NOTE: Dummy store for multiple users while bot running
function TokenStore() {
  this.tokens = [];
}

TokenStore.prototype.addToken = function (id, token) {
  this.tokens.push([id, token]);
};

TokenStore.prototype.getToken = function (id) {
  const token = this.tokens.find((t) => t[0] === id);
  return token && token[1];
};

module.exports = {
  TokenStore,
};
