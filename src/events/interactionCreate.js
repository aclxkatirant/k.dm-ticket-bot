const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField } = require('discord.js');
const discordTranscripts = require('discord-html-transcripts');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;
            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'Komut çalıştırılırken bir hata oluştu.', ephemeral: true });
            }
            return;
        }

        if (interaction.isButton()) {
            if (interaction.customId === 'clear_dm_history') {
                if (interaction.channel.type !== ChannelType.DM) return;

                await interaction.reply({ content: '⏳ Sohbet geçmişindeki bot mesajları temizleniyor, bu işlem mesaj sayısına göre biraz sürebilir...', ephemeral: true });

                try {
                    let deletedCount = 0;
                    let fetchMore = true;
                    let lastId;

                    while (fetchMore) {
                        const options = { limit: 100 };
                        if (lastId) options.before = lastId;

                        const messages = await interaction.channel.messages.fetch(options);
                        if (messages.size === 0) {
                            fetchMore = false;
                            break;
                        }

                        lastId = messages.last().id;

                        const botMessages = messages.filter(m => m.author.id === client.user.id);

                        for (const [id, msg] of botMessages) {
                            await msg.delete().catch(() => {});
                            deletedCount++;
                        }

                        if (messages.size < 100) fetchMore = false;
                    }

                    await interaction.editReply({ content: `✅ İşlem tamamlandı. Toplam **${deletedCount}** bot mesajı silindi.\n*(Discord kuralları gereği sadece kendi gönderdiğim mesajları silebiliyorum, sizin yazdıklarınız kalır.)*` });
                } catch (error) {
                    console.error("[SİSTEM HATASI] DM Temizleme:", error);
                    await interaction.editReply({ content: '❌ Mesajlar silinirken beklenmeyen bir hata oluştu.' });
                }
                return;
            }

            const sysConfig = client.db.config[interaction.guild?.id];

            if (interaction.customId === 'create_dm_ticket') {
                if (!sysConfig) return interaction.reply({ content: 'Sistem kurulumu yapılmamış.', ephemeral: true });

                if (client.db.ticketData.has(interaction.user.id)) {
                    return interaction.reply({ content: 'Zaten aktif bir destek talebiniz bulunuyor.', ephemeral: true });
                }

                let dmMessage;
                try {
                    const initEmbed = new EmbedBuilder()
                        .setTitle('✨ Ticket başarıyla oluşturuldu.')
                        .setDescription('Bota yazdığınız mesajlar doğrudan yetkili ekibimize iletilecektir.\nEn kısa sürede dönüş sağlanacaktır.')
                        .setColor('#FF0000');
                    dmMessage = await interaction.user.send({ embeds: [initEmbed] });
                } catch (error) {
                    return interaction.reply({ 
                        content: '❌ **Ticket oluşturulamadı :** Özel mesajlarınız (DM) kapalı. Lütfen DM kutunuzu açın.', 
                        ephemeral: true 
                    });
                }

                await interaction.reply({ content: '✅ **Ticket oluşturuldu.** Lütfen DM kutunuza geçin.', ephemeral: true });

                const ticketNumber = Math.floor(Math.random() * 90000) + 10000;
                const ticketChannel = await interaction.guild.channels.create({
                    name: `ticket-${ticketNumber}`,
                    parent: sysConfig.categoryId,
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                        { id: sysConfig.staffRoleId, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
                    ]
                });

                client.db.ticketData.set(interaction.user.id, { channelId: ticketChannel.id, guildId: interaction.guild.id });
                client.db.channelMap.set(ticketChannel.id, interaction.user.id);

                const açılışZamanı = Math.floor(Date.now() / 1000);

                const staffEmbed = new EmbedBuilder()
                    .setTitle('📂 Katirant - Ticket Paneli')
                    .addFields(
                        { name: '', value: `Ticket başarıyla <@${interaction.user.id}> tarafından <t:${açılışZamanı}:F> tarihinde **başarıyla** oluşturuldu.` },
                        { name: 'Ticket Sahibi', value: `${interaction.user.tag} (<@${interaction.user.id}>)` },
                        { name: 'Sistem Durumu', value: '🟢' }
                    )
                    .setColor('#FF0000');

                const closeRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('close_dm_ticket').setLabel('Sistemi Kapat & Logla').setEmoji('✖️').setStyle(ButtonStyle.Secondary)
                );

                await ticketChannel.send({ embeds: [staffEmbed], components: [closeRow] });
            }

            if (interaction.customId === 'close_dm_ticket') {
                if (!sysConfig) return;
                
                await interaction.reply('📂 Ticket kapatılıyor...');
                
                const userId = client.db.channelMap.get(interaction.channel.id);
                const user = await client.users.fetch(userId).catch(() => null);

                const attachment = await discordTranscripts.createTranscript(interaction.channel, {
                    limit: -1,
                    returnType: 'attachment',
                    filename: `${interaction.channel.name}-transcript.html`,
                    saveImages: true,
                    poweredBy: false
                });

                const logChannel = interaction.guild.channels.cache.get(sysConfig.logChannelId);
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setTitle('✨ Ticket Kapatıldı.')
                        .addFields(
                            { name: 'İşlem Yapan', value: `${interaction.user}` },
                            { name: 'Ticket Sahibi', value: `${user ? user.tag : 'Bilinmiyor'} (\`${userId}\`)` }
                        )
                        .setColor('#000000');
                    await logChannel.send({ embeds: [logEmbed], files: [attachment] });
                }

                if (user) {
                    const closedEmbed = new EmbedBuilder()
                        .setTitle('📂 Ticketınız kapatıldı.')
                        .setDescription('Yetkili ekibi talebinizi sonlandırdı.\n\n*Aşağıdaki butonu kullanarak botun size gönderdiği mesajları temizleyebilirsiniz.*')
                        .setColor('#000000');

                    const clearRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('clear_dm_history')
                            .setLabel('Mesajları Temizle')
                            .setEmoji('🗑️')
                            .setStyle(ButtonStyle.Danger) 
                    );

                    await user.send({ embeds: [closedEmbed], components: [clearRow] }).catch(() => {});
                }

                client.db.ticketData.delete(userId);
                client.db.channelMap.delete(interaction.channel.id);
                
                setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
            }
        }
    }
};
