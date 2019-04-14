'use strict';

import { Server } from './server';

const bToken = process.env.BOT_TOKEN;
const channelId = process.env.CHANNEL_ID;

const app = new Server(3000, bToken, channelId);
app.start();