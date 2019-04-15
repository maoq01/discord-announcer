'use strict';

import { Server } from './server';

const bToken = process.env.BOT_TOKEN;
const channelId = process.env.CHANNEL_ID;
const port = process.env.PORT;

const app = new Server(port, bToken, channelId);
app.start();