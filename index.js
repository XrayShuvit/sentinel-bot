require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  Events,
  EmbedBuilder,
  ApplicationCommandOptionType,
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Sentinel ist online als ${readyClient.user.tag}`);

  const commands = [
    {
      name: "ping",
      description: "Prüft, ob Sentinel erreichbar ist.",
    },
    {
      name: "serverinfo",
      description: "Zeigt Informationen über den Server.",
    },
    {
      name: "userinfo",
      description: "Zeigt Informationen über einen Discord-Nutzer.",
      options: [
        {
          name: "nutzer",
          description: "Wähle einen Discord-Nutzer aus.",
          type: ApplicationCommandOptionType.User,
          required: false,
        },
      ],
    },
  ];

  for (const server of readyClient.guilds.cache.values()) {
    await server.commands.set(commands);
  }

  console.log("Die Befehle wurden registriert.");
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply("Pong! 🏓 Sentinel funktioniert.");
  }

  if (interaction.commandName === "serverinfo") {
    const server = interaction.guild;

    const serverInfo = new EmbedBuilder()
      .setColor("#c7ff18")
      .setTitle(server.name)
      .setDescription("Hier sind einige Informationen über diesen Server.")
      .addFields(
        {
          name: "Mitglieder",
          value: `${server.memberCount}`,
          inline: true,
        },
        {
          name: "Erstellt am",
          value: server.createdAt.toLocaleDateString("de-DE"),
          inline: true,
        },
        {
          name: "Server-ID",
          value: server.id,
        }
      )
      .setThumbnail(server.iconURL())
      .setFooter({
        text: "Sentinel Serverinfo",
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [serverInfo],
    });
  }

  if (interaction.commandName === "userinfo") {
    const selectedUser =
      interaction.options.getUser("nutzer") ?? interaction.user;

    const userInfo = new EmbedBuilder()
      .setColor("#5865f2")
      .setTitle(`Informationen über ${selectedUser.username}`)
      .setThumbnail(
        selectedUser.displayAvatarURL({
          size: 256,
        })
      )
      .addFields(
        {
          name: "Benutzername",
          value: selectedUser.username,
          inline: true,
        },
        {
          name: "Anzeigename",
          value: selectedUser.globalName ?? "Nicht festgelegt",
          inline: true,
        },
        {
          name: "Discord-ID",
          value: selectedUser.id,
        },
        {
          name: "Konto erstellt am",
          value: selectedUser.createdAt.toLocaleDateString("de-DE"),
        }
      )
      .setFooter({
        text: "Sentinel Userinfo",
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [userInfo],
    });
  }
});

client.login(process.env.DISCORD_TOKEN);