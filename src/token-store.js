// NOTE: Dummy store for multiple users while bot running
function createTokenStore() {
  const tokens = [];
  function addToken(id, token) {
    tokens.push([id, token]);
  }
  function getToken(id) {
    const token = tokens.find((t) => t[0] === id);
    return token && token[1];
  }
  return {
    addToken,
    getToken,
  };
}

module.exports = {
  createTokenStore,
};
