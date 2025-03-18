import "dotenv/config";
import fs from "fs";
import Fastify from "fastify";
import { WebSocketServer } from "ws";
import fastifyRawBody from "fastify-raw-body";

import { global } from "@/context";
import {
  WEBHOOK_PORT,
  WEBSOCKET_PORT,
  USE_SSL,
  SSL_CERT_PATH,
  SSL_KEY_PATH,
} from "./consts";

import WebhookRoute from "@/routes/webhook";

declare module "fastify" {
  interface FastifyRequest {
    global: typeof global;
  }
}

const startServer = async (globalRef: typeof global) => {
  const fastifyOpts: any = {
    logger: true,
  };

  const fastify = Fastify(fastifyOpts);

  fastify.addHook("preHandler", async (req, _reply) => {
    req.global = globalRef;
  });

  fastify.register(fastifyRawBody, {
    field: "rawBody",
    global: false,
    encoding: "utf8",
    runFirst: true,
  });

  fastify.register(WebhookRoute, { prefix: "/webhook" });

  await fastify.listen({ port: WEBHOOK_PORT, host: "0.0.0.0" });
};

const start = async () => {
  try {
    let wsServer: WebSocketServer;
    if (USE_SSL) {
      const https = require("node:https");
      const sslOptions = {
        key: fs.readFileSync(SSL_KEY_PATH),
        cert: fs.readFileSync(SSL_CERT_PATH),
      };

      const secureServer = https.createServer(sslOptions);
      wsServer = new WebSocketServer({ server: secureServer });
      secureServer.listen(WEBSOCKET_PORT, () => {
        console.log(
          `Secure WebSocket server is listening on port ${WEBSOCKET_PORT}`
        );
      });
    } else {
      wsServer = new WebSocketServer({ port: WEBSOCKET_PORT });
      console.log(`WebSocket server is listening on port ${WEBSOCKET_PORT}`);
    }

    const globalRef: typeof global = {
      appName: "Flagtron",
      version: "1.0.0",
      wsServer,
    };

    await startServer(globalRef);
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

start();
