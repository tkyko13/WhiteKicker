let program = require("commander");
let wker = require("./wker.js");

let text = process.argv[2];
if (text == null) {
  text = "しらける";
}
program.option("-v verbose", "Add verbose").parse(process.argv);

if (program.verbose) console.log("dev mode");

wker(text).then(console.log);
