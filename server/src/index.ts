import "dotenv/config";
import { global } from "@/context";
import Fastify from "fastify";
import { WEBHOOK_PORT, WEBSOCKET_PORT } from "./consts";
import { WebSocketServer } from "ws";
import fastifyRawBody from "fastify-raw-body";
//routes
import WebhookRoute from "@/routes/webhook";

declare module "fastify" {
  interface FastifyRequest {
    global: typeof global;
  }
}
const startServer = async (globalRef: typeof global) => {
  const fastify = Fastify({ logger: true });

  fastify.addHook("preHandler", async (req, _reply) => {
    req.global = globalRef;
  });
  fastify.register(fastifyRawBody, {
    field: "rawBody", // the name of the field in the request object where the raw body is stored
    global: false, // add the rawBody to every request (or only when explicitly enabled)
    encoding: "utf8", // set to false to get a Buffer, or "utf8" to get a string
    runFirst: true, // get the body before any preParsing hook modifies it
  });
  fastify.register(WebhookRoute, { prefix: "/webhook" });

  await fastify.listen({ port: WEBHOOK_PORT, host: "0.0.0.0" });
};

const start = async () => {
  try {
    const globalRef: typeof global = {
      appName: "Flagtron",
      version: "1.0.0",
      wsServer: new WebSocketServer({ port: WEBSOCKET_PORT }),
    };

    await startServer(globalRef);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

start();
