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
const { createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const { createReadStream } = require('fs');
const path = require('path');
const subscription = connection.subscribe(audioPlayer);

module.exports = {
data: new SlashCommandBuilder()
.setName('play')
.setDescription('Play audio in the voice channel'),
async execute(interaction) {
const member = interaction.guild.members.cache.get(interaction.user.id);
if (member.voice.channel) {
try {
const audioPlayer = createAudioPlayer();
const audioFilePath = path.resolve(__dirname, 'benguin.mp3');
const audioResource = createAudioResource(createReadStream(audioFilePath));
audioPlayer.play(audioResource);
audioPlayer.on(AudioPlayerStatus.Idle, () => {
// Optionally destroy the connection when playback is complete
// connection.destroy();
});
interaction.reply('Playing audio in the voice channel!');
} catch (error) {
console.error('Error:', error);
interaction.reply('Error playing audio. Check console for details.');
}
} else {
interaction.reply('You need to be in a voice channel to use this command!');
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

fs.readdirSync('./commands').forEach(file => {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
});

const eventFiles = fs.readdirSync(path.join(__dirname, 'events')).filter(file => file.endsWith('.js'));

eventFiles.forEach(file => {
  const event = require(`./events/${file}`);
  const eventName = file.split('.')[0];
  
  if (typeof event === 'function') {
    client.on(eventName, event.bind(null, client));
  } else {
    console.error(`Event handler in ${file} is not a function.`, event);
  }
});

client.distube = new DisTube(client, {
    plugins: [
        new YouTubePlugin(),     // Supports YouTube
        new SpotifyPlugin(),     // Supports Spotify
        new SoundCloudPlugin(),  // Supports SoundCloud
        new DeezerPlugin(),      // Supports Deezer
        new DirectLinkPlugin(),  // Supports direct audio links
        new YtDlpPlugin(),       // Supports 700+ sites including YouTube
    ],
});

require('./events/distubeEvents')(client);

const express = require("express");
const app = express();
const port = 3000;
app.get('/', (req, res) => {
    const imagePath = path.join(__dirname, 'index.html');
    res.sendFile(imagePath);
});
app.listen(port, () => {
    console.log(`🔗 Listening to GlaceYT : http://localhost:${port}`);
});


client.login(process.env.TOKEN);

module.exports = client;


/*

  ________.__                        _____.___.___________
 /  _____/|  | _____    ____  ____   \__  |   |\__    ___/
/   \  ___|  | \__  \ _/ ___\/ __ \   /   |   |  |    |   
\    \_\  \  |__/ __ \\  \__\  ___/   \____   |  |    |   
 \______  /____(____  /\___  >___  >  / ______|  |____|   
        \/          \/     \/    \/   \/                  

╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║  ## Created by GlaceYT!                                                ║
║  ## Feel free to utilize any portion of the code                       ║
║  ## DISCORD :  https://discord.com/invite/xQF9f9yUEM                   ║
║  ## YouTube : https://www.youtube.com/@GlaceYt                         ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝


*/
