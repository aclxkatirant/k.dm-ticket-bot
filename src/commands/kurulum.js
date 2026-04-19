const { SlashCommandBuilder, PermissionsBitField, ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kurulum')
        .setDescription('DM Ticket sistemini kurar.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator) // SADECE YÖNETİCİLER
        .addChannelOption(option => option.setName('kategori').setDescription('Biletlerin açılacağı kategori').setRequired(true).addChannelTypes(ChannelType.GuildCategory))
        .addRoleOption(option => option.setName('yetkili').setDescription('Biletleri görecek yetkili rolü').setRequired(true))
        .addChannelOption(option => option.setName('panel').setDescription('Oluşturma panelinin atılacağı kanal').setRequired(true).addChannelTypes(ChannelType.GuildText))
        .addChannelOption(option => option.setName('log').setDescription('Transcriptlerin gideceği kanal').setRequired(true).addChannelTypes(ChannelType.GuildText)),
        
    async execute(interaction, client) {
        const kategori = interaction.options.getChannel('kategori');
        const yetkili = interaction.options.getRole('yetkili');
        const panel = interaction.options.getChannel('panel');
        const log = interaction.options.getChannel('log');

        client.db.config[interaction.guild.id] = {
            categoryId: kategori.id,
            staffRoleId: yetkili.id,
            logChannelId: log.id
        };

        const setupPath = path.join(__dirname, '../../setup.json');
        fs.writeFileSync(setupPath, JSON.stringify(client.db.config, null, 4));

        const panelEmbed = new EmbedBuilder()
            .setTitle('Katirant - Ticket Paneli')
            .setDescription('Yetkili ekibimizle doğrudan DM üzerinden iletişime geçmek için aşağıdaki butona tıklayın.\n\n**DİKKAT:** İşleme başlamadan önce özel mesajlarınızın (DM) açık olduğundan emin olun.')
            .setColor('#FF0000')
            .setFooter({ text: 'Kati Systems | Güvenli Destek Altyapısı' });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('create_dm_ticket')
                    .setLabel('Destek Talebi Oluştur')
                    .setEmoji('📩')
                    .setStyle(ButtonStyle.Danger)
            );

        await panel.send({ embeds: [panelEmbed], components: [row] });
        await interaction.reply({ content: 'Sistem başarıyla kuruldu ve ayarlar kalıcı olarak kaydedildi.', ephemeral: true });
    }
};
