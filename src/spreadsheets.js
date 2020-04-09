const { TokenStore } = require("./token-store");
const { google } = require("googleapis");
const AsciiTable = require("ascii-table");

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

function createoAuth2Client(credentials) {
  const tokenStore = new TokenStore();
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
    getClient() {
      return oAuth2Client;
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

function getSheetData(currentSheetOptions, auth, author) {
  const sheets = google.sheets({ "version": "v4", auth });
  sheets.spreadsheets.values.get(currentSheetOptions, (err, res) => {
    if (err) {
      return author.send("The API returned an error: " + err);
    }
    const rows = res.data.values;
    if (rows.length) {
      const table = AsciiTable.factory({
        "heading": rows.splice(0, 1)[0],
        rows,
      });
      author.send(`\`\`\`${table}\`\`\``);
    } else {
      console.log("No data found.");
    }
  });
}

module.exports = {
  createoAuth2Client,
  getSheetData,
  setSheetOptions,
};
