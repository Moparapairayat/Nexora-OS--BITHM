import { app } from "./app.js";
import { env } from "./config/env.js";

const server = app.listen(env.port, () => {
  console.log(`Nexora API listening on http://localhost:${env.port}`);
});

function shutdown(signal: NodeJS.Signals) {
  console.log(`Nexora API received ${signal}; closing HTTP server.`);
  server.close(() => {
    console.log("Nexora API stopped.");
  });
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
