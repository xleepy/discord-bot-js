const { createTokenStore } = require("./token-store");
const { google } = require("googleapis");

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

function createoAuth2Client(credentials) {
  const tokenStore = createTokenStore();
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
  // TODO: further changes/cleanup needed (still not a perfect solution)
  return {
    isAuthenticated(userId) {
      return !!tokenStore.getToken(userId);
    },
    generateAuthUrl() {
      return oAuth2Client.generateAuthUrl({
        "access_type": "offline",
        "scope": SCOPES,
      });
    },
    setToken(id, token, errFallback) {
      const storedToken = tokenStore.getToken(id);
      if (storedToken) {
        oAuth2Client.setCredentials(storedToken);
        return;
      }
      oAuth2Client.getToken(token, (err, token) => {
        if (err) {
          errFallback(
            `Error while trying to retrieve access token: ${err.message}`
          );
          return console.error(
            "Error while trying to retrieve access token",
            err
          );
        }
        oAuth2Client.setCredentials(token);
        tokenStore.addToken(id, token);
      });
    },
    getSheetData(userId, currentSheetOptions, onResponse) {
      const token = tokenStore.getToken(userId);
      if (token) {
        oAuth2Client.setCredentials(token);
        const sheets = google.sheets({ "version": "v4", auth: oAuth2Client });
        sheets.spreadsheets.values.get(currentSheetOptions, onResponse);
      }
    },
  };
}

function setSheetOptions(message) {
  const splittedStr = message.split(" ");
  const spreadsheetId = splittedStr[1];
  const range = splittedStr[2];
  return {
    spreadsheetId,
    range,
  };
}

module.exports = {
  createoAuth2Client,
  setSheetOptions,
};
