const express = require("express");
const path = require('path')

const port = 80;

const app = express();

app.use("/", express.static(path.join(__dirname, "..", "frontend", "dist")));

app.listen(port, () => {
    console.log(`Hey yo im on http://127.0.0.1:${port}!`);
});