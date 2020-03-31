const fs = require("fs");
const { MessageEmbed } = require("discord.js");
const { google } = require("googleapis");

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = "token.json";

function createoAuth2Client(credentials, authFallback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, authFallback);
    oAuth2Client.setCredentials(JSON.parse(token));
  });
  return function(callback) {
    callback(oAuth2Client);
  };
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */

function getNewToken(oAuth2Client, authFallback) {
  console.log("here");
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES
  });
  authFallback(authUrl, token => {
    oAuth2Client.getToken(token, (err, token) => {
      if (err)
        console.error("Error while trying to retrieve access token", err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
        if (err) return console.error(err);
      });
    });
  });
}

function setSheetOptions(msg) {
  const message = msg.content.split(" ");
  const spreadsheetId = message[1];
  const range = message[2];
  return {
    spreadsheetId,
    range
  };
}

//"1CA_vXjiRw4fpPAnTpfOHktbBRloYCK9X0CJrEM1NHWY"
// "Лист1!A1:J3"

function getSheetData(currentSheetOptions, auth, author) {
  const sheets = google.sheets({ version: "v4", auth });
  sheets.spreadsheets.values.get(currentSheetOptions, (err, res) => {
    if (err) return console.log("The API returned an error: " + err);
    const rows = res.data.values;
    if (rows.length) {
      const embedMessage = new MessageEmbed();
      embedMessage.color = "#b4b4b4";
      embedMessage.type = "rich";
      rows.map(row => {
        const title = row.splice(0, 1)[0] || "N/A";
        embedMessage.addField(title, row.join(" | "), false);
      });
      author.send(embedMessage);
    } else {
      console.log("No data found.");
    }
  });
}

module.exports = {
  createoAuth2Client,
  getSheetData,
  setSheetOptions
};
