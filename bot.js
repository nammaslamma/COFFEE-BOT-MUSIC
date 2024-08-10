require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const config = require('./config');
const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { YtDlpPlugin } = require('@distube/yt-dlp');
const { SoundCloudPlugin } = require('@distube/soundcloud');
const { DeezerPlugin } = require('@distube/deezer');
const { YouTubePlugin } = require('@distube/youtube');
const { DirectLinkPlugin } = require('@distube/direct-link');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { createAudioPlayer, createAudioResource, AudioPlayerStatus, joinVoiceChannel } = require('@discordjs/voice');
const { createReadStream } = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play audio in the voice channel'),
    async execute(interaction) {
        const member = interaction.guild.members.cache.get(interaction.user.id);
        if (member.voice.channel) {
            try {
                const connection = joinVoiceChannel({
                    channelId: member.voice.channel.id,
                    guildId: interaction.guild.id,
                    adapterCreator: interaction.guild.voiceAdapterCreator,
                });

                const audioPlayer = createAudioPlayer();
                const audioFilePath = path.resolve(__dirname, 'benguin.mp3');
                const audioResource = createAudioResource(createReadStream(audioFilePath));

                connection.subscribe(audioPlayer);
                audioPlayer.play(audioResource);

                audioPlayer.on(AudioPlayerStatus.Idle, () => {
                    connection.destroy();
                });

                await interaction.reply('Playing audio in the voice channel!');
            } catch (error) {
                console.error('Error:', error);
                await interaction.reply('Error playing audio. Check console for details.');
            }
        } else {
            await interaction.reply('You need to be in a voice channel to use this command!');
        }
    },
};

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.commands = new Collection();
client.config = config;

// Loading commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

// Loading events
const eventFiles = fs.readdirSync(path.join(__dirname, 'events')).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    const eventName = file.split('.')[0];
    if (typeof event === 'function') {
        client.on(eventName, event.bind(null, client));
    } else {
        console.error(`Event handler in ${file} is not a function.`, event);
    }
}

client.distube = new DisTube(client, {
    plugins: [
        new YouTubePlugin(),
        new SpotifyPlugin(),
        new SoundCloudPlugin(),
        new DeezerPlugin(),
        new DirectLinkPlugin(),
        new YtDlpPlugin(),
    ],
});

require('./events/distubeEvents')(client);

// Express server setup
const express = require("express");
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    const filePath = path.join(__dirname, 'index.html');
    res.sendFile(filePath);
});

app.listen(port, () => {
    console.log(`🔗 Listening to GlaceYT: http://localhost:${port}`);
});

client.login(process.env.TOKEN);

module.exports = client;
