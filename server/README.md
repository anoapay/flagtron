# Flagtron Server

Flagtron Server is a lightweight service that connects to Flagsmith and relays webhook events through WebSockets to clients for real-time feature flag updates.

## Installation

### Clone the Repository

```sh
git clone https://github.com/anoapay/flagtron.git
cd flagtron/server
```

### Install Dependencies

```sh
npm install && npm install -g tsx pm2
```

## Setting Up Flagsmith Webhooks

1. Go to your **Flagsmith Dashboard** and create a webhook.

![create-webhook](https://github.com/user-attachments/assets/12749fa0-cb3c-4035-9f11-09267d78759f)


2. Flagtron listens for webhook events from Flagsmith on **port 4567** by default. You can change this in the server's `.env` file under `FLAGSMITH_API`.

   Set the URL of a publicly exposed Flagtron instance here. For **secret**, enter a random string, which you will later specify in the `.env` file as `FLAGSMITH_WEBHOOK_SECRET`.

![edit-webhook](https://github.com/user-attachments/assets/650c7c54-aa86-4aef-8880-12250890d6af)


3. If using Flagsmith for **server-side flags**, create a **server environment key** and save it in the `.env` file as `FLAGSMITH_ENVIRONMENT_ID`.

![get-env-key](https://github.com/user-attachments/assets/715694ca-89fc-475c-8f29-44670f36b2e8)


## Configuring Environment Variables

Create a `.env` file by running:

```sh
nano .env
```

Then, copy and paste the following:

```ini
FLAGSMITH_API=<YOUR FLAGSITH INSTANCE OR API>
FLAGSMITH_ENVIRONMENT_ID=<YOUR FLAGSMITH SERVER ENVIRONMENT KEY>
FLAGSMITH_WEBHOOK_SECRET=<YOUR RANDOM SECRET>
```

### SSL Configuration (Optional)

If you want to expose the WebSocket through SSL, define the settings in the `.env` file:

```ini
USE_SSL=true
SSL_CERT_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
SSL_CERT_KEY_PATH=/etc/letsencrypt/live/yourdomain.com/privkey.pem
```

## Starting the Server

Run the following command to start Flagtron Server with **PM2**:

```sh
pm2 start "npm run start" --name "FLAGTRON_SERVER"
```

## Notes

- Ensure your `.env` file is properly configured before starting the server.
- If hosting externally, ensure your server allows incoming webhook requests on **port 4567**.
- Use **PM2** to keep the server running in the background.

## License

MIT
