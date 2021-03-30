import express from "express";
import winston from "winston";
import grades from "./router/grades.js";

const app = new express();

global.Db = "./base/grades.json";
global.nextId = 0;

createLogger();
startApi();

function startApi() {
  app.use(express.json());
  app.use(express.static("public"));
  mapRoutes();
  app.get("/", (_, res) => {
    res.send("servidor em execução!");
  });

  app.listen(3000, async () => {
    logger.info("API Started!");
  });
}

function mapRoutes() {
  app.use("/grades", grades);
}

function createLogger() {
  const { combine, timestamp, label, printf } = winston.format;
  const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
  });
  global.logger = winston.createLogger({
    level: "error",
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: "logs/logErro.log" }),
    ],
    format: combine(label({ label: "error" }), timestamp(), myFormat),
  });
  global.logger = winston.createLogger({
    level: "info",
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: "logs/logInfo.log" }),
    ],
    format: combine(label({ label: "info" }), timestamp(), myFormat),
  });
}
