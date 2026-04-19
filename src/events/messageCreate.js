const { Events, ChannelType } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message, client) {
        if (message.author.bot) return;

        if (message.channel.type === ChannelType.DM) {
            const ticket = client.db.ticketData.get(message.author.id);
            if (!ticket) return;

            try {
                const guild = client.guilds.cache.get(ticket.guildId);
                if (!guild) return;
                const channel = guild.channels.cache.get(ticket.channelId);
                
                if (channel) {
                    const webhooks = await channel.fetchWebhooks();
                    let webhook = webhooks.find(wh => wh.owner.id === client.user.id);
                    if (!webhook) {
                        webhook = await channel.createWebhook({ 
                            name: 'Kati Relay', 
                            avatar: client.user.displayAvatarURL() 
                        });
                    }

                    await webhook.send({
                        content: message.content || '*(Medya/Dosya)*',
                        username: message.author.username,
                        avatarURL: message.author.displayAvatarURL(),
                        files: Array.from(message.attachments.values())
                    });
                    
                    await message.react('✅');
                }
            } catch (err) {
                console.error("[E] Webhook iletimi başarısız:", err);
            }
        }

        if (client.db.channelMap.has(message.channel.id)) {
            const userId = client.db.channelMap.get(message.channel.id);
            
            try {
                const user = await client.users.fetch(userId);
                const content = `**${message.author.username}:** ${message.content}`;
                
                await user.send({ 
                    content: content,
                    files: Array.from(message.attachments.values())
                });
            } catch (err) {
                message.reply("Kullanıcıya ulaşılamadı (DM kilitli).").then(m => setTimeout(() => m.delete(), 5000));
            }
        }
    }
};
