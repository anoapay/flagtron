import { FastifyInstance } from "fastify";
import { RouteGenericInterface } from "fastify/types/route";
import { FeatureFlagEvent, ApiResponse } from "@/types";
import { FLAGSMITH_WEBHOOK_SECRET } from "@/consts";
import { log } from "@/utils";

import crypto from "crypto";

const verifyHmacSignature = (
  requestBody: Buffer,
  receivedSignature: Buffer,
  secret: Buffer
): boolean => {
  try {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(requestBody)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "hex"),
      receivedSignature
    );
  } catch (e) {
    log("Error verifying signature");
    console.error(e);
    return false;
  }
};

export const protectedAccountRoutes = (fastify: FastifyInstance) => {
  /*
      Route: /api/v1/business/update/kyc
  
  
      Function: Update the business name of the account
    */

  interface IWebhook extends RouteGenericInterface {
    Body: FeatureFlagEvent;
    Reply: ApiResponse<Boolean>; // put the response payload interface here
  }

  fastify.post<IWebhook>(
    "/",
    {
      config: { rawBody: true }, // Make sure fastify-raw-body is applied
    },
    async (
      req,
      reply // put the request interface here
    ) => {
      log("New flag detected");

      if (!req.global.wsServer) {
        log("ERR: Websocket server not initialized");
        return reply.send({ error: "Websocket server not initialized" });
      }

      const receivedSignature = req.headers["x-flagsmith-signature"];

      if (!receivedSignature || Array.isArray(receivedSignature)) {
        log("ERR: No signature provided or signature invalid");
        return reply.code(200).send({
          error: "No signature provided or signature invalid",
        });
      }

      // Instead of Buffer.from(JSON.stringify(req.body), "utf8"), do:
      const rawBody =
        typeof req.rawBody === "string"
          ? Buffer.from(req.rawBody, "utf8")
          : req.rawBody; // if you configured fastify-raw-body to give you a Buffer, you can use it directly

      if (!rawBody) {
        log("ERR: No raw body provided");
        return reply.code(200).send({ error: "No raw body provided" });
      }

      if (
        !verifyHmacSignature(
          rawBody,
          Buffer.from(receivedSignature, "hex"),
          Buffer.from(FLAGSMITH_WEBHOOK_SECRET, "utf8")
        )
      ) {
        log("ERR: Signatures do not match");
        return reply.code(200).send({ error: "Invalid signature" });
      }

      const { wsServer } = req.global;

      wsServer.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(req.body), { binary: false });
        }
      });

      log("Webhook event sent to all clients");
      reply.code(200).send({ data: true });
    }
  );
};
export default protectedAccountRoutes;
