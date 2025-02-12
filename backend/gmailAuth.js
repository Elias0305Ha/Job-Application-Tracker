const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");

// Load credentials from JSON file
const credentials = JSON.parse(fs.readFileSync("credentials.json"));
const { client_secret, client_id, redirect_uris } = credentials.installed;

// Create an OAuth2 client
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

// Generate authentication URL
const authUrl = oAuth2Client.generateAuthUrl({
  access_type: "offline",
  scope: ["https://www.googleapis.com/auth/gmail.readonly"],
});

console.log("Authorize this app by visiting this URL:", authUrl);

// Create an interface to read user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Ask for authorization code
rl.question("Enter the code from that page here: ", (code) => {
  rl.close();
  oAuth2Client.getToken(code, (err, token) => {
    if (err) {
      return console.error("Error retrieving access token", err);
    }
    oAuth2Client.setCredentials(token);
    fs.writeFileSync("token.json", JSON.stringify(token));
    console.log("Token stored successfully!");
  });
});
