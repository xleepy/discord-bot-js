const {
  createoAuth2Client,
  getSheetData,
  setSheetOptions
} = require("./spreadsheets.js");
const Discord = require("discord.js");
const config = require("dotenv").config();
const fs = require("fs");

const client = new Discord.Client();

let authorizedSheetsClient = null;

let sheetOptions = null;

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag} `);
});

client.on("message", msg => {
  console.log(msg.content);
  if (msg.content == "test") {
    authorizedSheetsClient(auth =>
      getSheetData(sheetOptions, auth, msg.author)
    );
  }
});

client.on("message", msg => {
  if (msg.content.includes("!setSheet")) {
    sheetOptions = setSheetOptions(msg);
  }
});

function authFallback(url, callback) {
  client.on("message", msg => {
    if (msg.content === "!newGame") {
      msg.author.send(
        `Sheets login url: \n ${url}  \n set login by cmd !token YOUR_TOKEN`
      );
    }
    if (msg.content.trim().includes("!token")) {
      const token = msg.content.split(" ")[1];
      if (token) {
        callback(msg.content.split(" ")[1]);
      }
    }
  });
}

client.login(config.parsed.APP_TOKEN).then(() => {
  fs.readFile("credentials.json", (err, content) => {
    if (err) return console.log("Error loading file:", err);
    // Authorize a client with credentials, then call the Google Sheets API.
    authorizedSheetsClient = createoAuth2Client(
      JSON.parse(content),
      authFallback
    );
  });
});
