'use strict';

import Koa from 'koa';
import { Client, GuildMember, VoiceChannel, TextChannel } from 'discord.js';
import { get, set } from 'lodash';

const _ = Object.freeze({
    get: get,
    set: set
});

let usersLastTTS = {}

export class Server {
    private port: string;
    private botToken: string;
    private app: Koa;
    private discordBot: Client;
    private channelId: string;

    constructor(port: string, botToken: string, recipientChannelId: string ) {
        this.port = port;
        this.botToken = botToken;
        this.app = new Koa();
        this.discordBot = new Client();
        this.channelId = recipientChannelId;
    }

    public start() {
        this.app.listen(this.port, () => {
            console.log("Server running on port", this.port);

            this.discordBot.on('error', (error: Error) => {
                console.error(error);
                process.exit(1);
            });
            
            this.discordBot.login(this.botToken)
            .catch((error: Error) => {
                console.error(error);
                process.exit(1);
            });

            this.actOnChannelEvents();
        });
    }

    async actOnChannelEvents() {

        this.discordBot.on('voiceStateUpdate', async (oldMember: GuildMember, newMember: GuildMember) => {
            const newUserChannel: VoiceChannel = newMember.voiceChannel;
            const oldUserChannel: VoiceChannel = oldMember.voiceChannel;
            let guildMember: GuildMember;
            let messageAction: string;
            let channelName: string;

            let sendMessage: boolean = false;

            // user joins voice
            if(newUserChannel !== undefined && newUserChannel !== oldUserChannel) {
                guildMember = newMember;
                channelName = newUserChannel.name;
                messageAction = "joined";
                sendMessage = true;
            }
            
            // user leaves voice
            else if(newUserChannel === undefined) {
                guildMember = oldMember;
                channelName = oldUserChannel.name;
                messageAction = "left";
                sendMessage = true;
            }
            
            // send message to text channel
            if(sendMessage) {
                const userName = guildMember.nickname || guildMember.user.username;
                const messageContent = `${userName} ${messageAction} ${channelName}`;

                const now = new Date();
                const lastTTS = _.get(usersLastTTS, userName);

                let ttsFlag: boolean;
                if(lastTTS !== undefined) {
                    const timeDifference: number = now.getTime() - new Date(lastTTS).getTime();
                    if(timeDifference > 20000) {
                        ttsFlag = true;
                        _.set(usersLastTTS, userName, new Date());
                    }
                } else {
                    ttsFlag = true;
                    _.set(usersLastTTS, userName, new Date());
                }

                console.log("trying to send message:", messageContent);
                const channel: TextChannel = guildMember.guild.channels.get(this.channelId) as TextChannel;

                try {
                    await channel.send(messageContent, { tts: ttsFlag })
                    .then(() => {
                        console.log("message sent @", new Date());
                    })
                    .catch((error: Error) => {
                        console.error(error);
                        process.exit(1);
                    });
                } catch (error) {
                    console.error(error);
                    process.exit(1);
                }
                
            }
        });
    }
}