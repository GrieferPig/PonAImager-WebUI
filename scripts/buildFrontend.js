const cp = require("child_process");
const path = require("path");

let rootPath = path.join(__dirname, "..", "frontend");

cp.exec(`cd ${rootPath} && npm run build`, (error, out, err) => {
  console.log(out, err);
});
