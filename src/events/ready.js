const { Events, REST, Routes } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`[S] ${client.user.tag} olarak giriş yapıldı.`);
        
        const commandsArray = client.commands.map(cmd => cmd.data.toJSON());
        const rest = new REST({ version: '10' }).setToken(config.token);
        
        try {
            console.log(`[S] Komutlar ${config.guildId} ID'li sunucuya yükleniyor...`);
            await rest.put(
                Routes.applicationGuildCommands(config.clientId, config.guildId),
                { body: commandsArray }
            );
            console.log('[S] Slash komutları başarıyla sunucuya yüklendi (Anında aktif).');
        } catch (error) {
            console.error('[E] Slash komutları yüklenirken hata oluştu:', error);
        }
    },
};
