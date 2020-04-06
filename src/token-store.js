// NOTE: Dummy store for multiple users while bot running
function TokenStore() {
  this.tokens = [];
}

TokenStore.prototype.addToken = function (id, token) {
  this.tokens[id] = token;
};

TokenStore.prototype.getToken = function (id) {
  return this.tokens[id];
};

module.exports = {
  TokenStore,
};
