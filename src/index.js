const { createoAuth2Client, setSheetOptions } = require("./spreadsheets.js");
const Discord = require("discord.js");
const config = require("dotenv").config();
const fs = require("fs");
const AsciiTable = require("ascii-table");

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

function handleTableResponse(author) {
  return (err, res) => {
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
  };
}

function messageHandler({ author, content }) {
  console.log(content);
  if (content === "!newUser") {
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
    // Check if user already have token if have it set user token and send tables
    if (authorizedSheetsClient.isAuthenticated(author.id)) {
      authorizedSheetsClient.getSheetData(
        author.id,
        sheetOptions,
        handleTableResponse(author)
      );
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
