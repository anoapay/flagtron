import { FastifyInstance } from "fastify";
import { RouteGenericInterface } from "fastify/types/route";
import { FeatureFlagEvent, ApiResponse } from "@/types";
import { FLAGSMITH_WEBHOOK_SECRET } from "@/consts";
import crypto from "crypto";

const verifyHmacSignature = (
  requestBody: string | Buffer,
  receivedSignature: string,
  secret: string
): boolean => {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(requestBody)
    .digest("hex");
  const expectedBuffer = Buffer.from(expectedSignature, "utf-8");
  const receivedBuffer = Buffer.from(receivedSignature, "utf-8");

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, "utf-8"),
    Buffer.from(receivedSignature, "utf-8")
  );
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
    async (
      req,
      reply // put the request interface here
    ) => {
      if (!req.global.wsServer) {
        return reply.send({ error: "Websocket server not initialized" });
      }

      const receivedSignature = req.headers["x-flagsmith-signature"];

      if (!receivedSignature || Array.isArray(receivedSignature)) {
        return reply.send({
          error: "No signature provided or signature invalid",
        });
      }

      if (
        !verifyHmacSignature(
          JSON.stringify(req.body),
          receivedSignature,
          FLAGSMITH_WEBHOOK_SECRET
        )
      ) {
        return reply.send({ error: "Invalid signature" });
      }

      const { wsServer } = req.global;

      wsServer.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(req.body), { binary: false });
        }
      });

      console.log("FLAG UPDATED!");
      reply.send({ data: true });
    }
  );
};
export default protectedAccountRoutes;
