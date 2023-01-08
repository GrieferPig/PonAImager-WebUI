const fs = require("fs");
const path = require("path");

let rootPath = path.join(__dirname, "..");

fs.unlinkSync(path.join(rootPath, "dist"));
fs.unlinkSync(path.join(rootPath, frontend, "dist"));

console.log("Cleaned generated files.");
