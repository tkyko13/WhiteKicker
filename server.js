"use strict";

const express = require("express");
const line = require("@line/bot-sdk");
const wker = require("./wker");
const PORT = process.env.PORT || 3000;

const config = {
  channelSecret: "YOUR_SECRET",
  channelAccessToken: "YOUR_ACCESS_TOKEN"
};

const app = express();

app.get("/", (req, res) => res.send("Hello LINE BOT! wker"));
app.post("/webhook", line.middleware(config), (req, res) => {
  console.log(req.body.events);
  Promise.all(req.body.events.map(handleEvent)).then(result =>
    res.json(result)
  );
});

const client = new line.Client(config);

function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }

  let resMess = event.message.text;
  // devという文字があればデバッグモード
  let dev = "";
  // if (resMess.indexOf("dev") >= 0) {
  if (/dev/.test(resMess)) {
    dev = "-v";
    resMess = resMess.replace("dev", "");
  }

  wker(resMess).then(function(data) {
    let retText = "";
    if (dev == "-v") {
      retText += data.kanji.join(" ") + "\n";
      retText += data.en.join(" ") + "\n";
      retText += data.text;
    } else {
      retText += data.text;
    }
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: retText //実際に返信の言葉を入れる箇所
    });
  });
}

// app.listen(PORT);
process.env.NOW_REGION ? (module.exports = app) : app.listen(PORT); //now
console.log(`Server running at ${PORT}`);
