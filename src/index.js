const {
  createoAuth2Client,
  getSheetData,
  setSheetOptions,
} = require("./spreadsheets.js");
const Discord = require("discord.js");
const config = require("dotenv").config();
const fs = require("fs");

const client = new Discord.Client();

let authorizedSheetsClient = null;

let sheetOptions = null;

function handleNewUser(author) {
  if (authorizedSheetsClient.isAuthenticated(author.id)) {
    author.send(
      "Set spreadsheet options by !setSheet YOUR_SPREAD_SHEET_ID RANGE(LIST_NAME!LIST_RANGE)"
    );
    return;
  }
  author.send(authorizedSheetsClient.generateAuthUrl());
}

function messageHandler({ author, content }) {
  console.log(content);
  if (content === "!newGame") {
    handleNewUser(author);
  }
  if (content.includes("!setToken")) {
    const token = content.trim().split(" ")[1];
    if (token) {
      authorizedSheetsClient.setToken(author.id, token, (errorMsg) =>
        author.send(errorMsg)
      );
    }
  }
  if (content.includes("!setSheet")) {
    sheetOptions = setSheetOptions(content);
  }
  if (content === "test") {
    if (authorizedSheetsClient.isAuthenticated(author.id)) {
      getSheetData(sheetOptions, authorizedSheetsClient.getClient(), author);
    } else {
      handleNewUser(author);
    }
  }
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag} `);
});

client.on("message", messageHandler);

client.login(config.parsed.APP_TOKEN).then(() => {
  fs.readFile("credentials.json", (err, content) => {
    if (err) {
      return console.log("Error loading file:", err);
    }
    // Authorize a client with credentials, then call the Google Sheets API.
    authorizedSheetsClient = createoAuth2Client(JSON.parse(content));
  });
});
