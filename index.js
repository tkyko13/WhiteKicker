"use strict";

const express = require("express");
const wker = require("./wker");
const PORT = process.env.PORT || 3000;

const app = express();

app.get("/:text", (req, res) => {
  console.log(req.params);
  let text = req.params.text;
  wker(text).then(function(data) {
    res.send(data);
  });
});

app.listen(PORT);
console.log(`Server running at ${PORT}`);
