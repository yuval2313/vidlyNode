const config = require("config");
const logger = require("./startup/logging");

const express = require("express");
const app = express();

require("./startup/config")();
require("./startup/cors")(app);
require("./startup/routes")(app);
require("./startup/db")();
require("./startup/validation")();
require("./startup/prod")(app);

const port = process.env.PORT || config.get("port");
const server = app.listen(port, () =>
  logger.info(`listening on port ${port}...`)
);

module.exports = server;
