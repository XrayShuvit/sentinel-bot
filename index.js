require("dotenv").config();

const {
  addWarning,
  getWarnings,
} = require("./database");

const {
  Client,
  GatewayIntentBits,
  Events,
  EmbedBuilder,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once(Events.ClientReady, async (readyClient) => {
  console.log(
    `Sentinel ist online als ${readyClient.user.tag}`
  );

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
    {
      name: "clear",
      description: "Löscht Nachrichten aus dem aktuellen Kanal.",
      options: [
        {
          name: "anzahl",
          description: "Wie viele Nachrichten sollen gelöscht werden?",
          type: ApplicationCommandOptionType.Integer,
          required: true,
          min_value: 1,
          max_value: 100,
        },
      ],
    },
    {
      name: "willkommen-test",
      description: "Zeigt eine Vorschau der Begrüßungsnachricht.",
    },
    {
      name: "warn",
      description: "Verwarnt ein Mitglied.",
      options: [
        {
          name: "nutzer",
          description: "Welches Mitglied soll verwarnt werden?",
          type: ApplicationCommandOptionType.User,
          required: true,
        },
        {
          name: "grund",
          description: "Warum wird das Mitglied verwarnt?",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
    {
      name: "warnungen",
      description: "Zeigt die Verwarnungen eines Mitglieds.",
      options: [
        {
          name: "nutzer",
          description:
            "Von welchem Mitglied sollen Warnungen angezeigt werden?",
          type: ApplicationCommandOptionType.User,
          required: true,
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
    await interaction.reply(
      "Pong! 🏓 Sentinel funktioniert."
    );
  }

  if (interaction.commandName === "serverinfo") {
    const server = interaction.guild;

    const serverInfo = new EmbedBuilder()
      .setColor("#c7ff18")
      .setTitle(server.name)
      .setDescription(
        "Hier sind einige Informationen über diesen Server."
      )
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
      .setFooter({
        text: "Sentinel Serverinfo",
      })
      .setTimestamp();

    const serverIcon = server.iconURL();

    if (serverIcon) {
      serverInfo.setThumbnail(serverIcon);
    }

    await interaction.reply({
      embeds: [serverInfo],
    });
  }

  if (interaction.commandName === "userinfo") {
    const selectedUser =
      interaction.options.getUser("nutzer") ??
      interaction.user;

    const userInfo = new EmbedBuilder()
      .setColor("#5865f2")
      .setTitle(
        `Informationen über ${selectedUser.username}`
      )
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
          value:
            selectedUser.globalName ??
            "Nicht festgelegt",
          inline: true,
        },
        {
          name: "Discord-ID",
          value: selectedUser.id,
        },
        {
          name: "Konto erstellt am",
          value: selectedUser.createdAt.toLocaleDateString(
            "de-DE"
          ),
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

  if (interaction.commandName === "willkommen-test") {
    const welcomeTest = new EmbedBuilder()
      .setColor("#c7ff18")
      .setTitle("Willkommen auf dem Server!")
      .setDescription(
        `Hey ${interaction.user}, schön, dass du auf **${interaction.guild.name}** dabei bist!`
      )
      .setThumbnail(
        interaction.user.displayAvatarURL({
          size: 256,
        })
      )
      .addFields({
        name: "Mitglied Nummer",
        value: `${interaction.guild.memberCount}`,
      })
      .setFooter({
        text: "Sentinel Begrüßungssystem · Vorschau",
      })
      .setTimestamp();

    await interaction.reply({
      content: `Willkommen ${interaction.user}! 👋`,
      embeds: [welcomeTest],
    });
  }

  if (interaction.commandName === "clear") {
    const hasPermission =
      interaction.memberPermissions.has(
        PermissionFlagsBits.ManageMessages
      );

    if (!hasPermission) {
      await interaction.reply({
        content:
          "Du darfst keine Nachrichten verwalten.",
        ephemeral: true,
      });

      return;
    }

    const amount =
      interaction.options.getInteger("anzahl");

    await interaction.deferReply({
      ephemeral: true,
    });

    const deletedMessages =
      await interaction.channel.bulkDelete(
        amount,
        true
      );

    await interaction.editReply(
      `${deletedMessages.size} Nachrichten wurden gelöscht.`
    );
  }

  if (interaction.commandName === "warn") {
    const hasPermission =
      interaction.memberPermissions.has(
        PermissionFlagsBits.ModerateMembers
      );

    if (!hasPermission) {
      await interaction.reply({
        content:
          "Du darfst keine Mitglieder verwarnen.",
        ephemeral: true,
      });

      return;
    }

    const selectedUser =
      interaction.options.getUser("nutzer");

    const reason =
      interaction.options.getString("grund");

    if (selectedUser.bot) {
      await interaction.reply({
        content: "Bots können nicht verwarnt werden.",
        ephemeral: true,
      });

      return;
    }

    if (selectedUser.id === interaction.user.id) {
      await interaction.reply({
        content:
          "Du kannst dich nicht selbst verwarnen.",
        ephemeral: true,
      });

      return;
    }

    addWarning(
      interaction.guild.id,
      selectedUser.id,
      interaction.user.id,
      reason
    );

    const warningEmbed = new EmbedBuilder()
      .setColor("#ff9f1c")
      .setTitle("Verwarnung gespeichert")
      .addFields(
        {
          name: "Mitglied",
          value: `${selectedUser}`,
        },
        {
          name: "Moderator",
          value: `${interaction.user}`,
        },
        {
          name: "Grund",
          value: reason,
        }
      )
      .setFooter({
        text: "Sentinel Warnsystem",
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [warningEmbed],
    });
  }

  if (interaction.commandName === "warnungen") {
    const hasPermission =
      interaction.memberPermissions.has(
        PermissionFlagsBits.ModerateMembers
      );

    if (!hasPermission) {
      await interaction.reply({
        content:
          "Du darfst keine Verwarnungen einsehen.",
        ephemeral: true,
      });

      return;
    }

    const selectedUser =
      interaction.options.getUser("nutzer");

    const warnings = getWarnings(
      interaction.guild.id,
      selectedUser.id
    );

    if (warnings.length === 0) {
      await interaction.reply({
        content:
          `${selectedUser} hat keine Verwarnungen.`,
        ephemeral: true,
      });

      return;
    }

    await interaction.reply({
      content:
        `${selectedUser} hat ${warnings.length} Verwarnung(en).`,
      ephemeral: true,
    });
  }
});

client.on(Events.GuildMemberAdd, async (member) => {
  const channel = member.guild.systemChannel;

  if (!channel) {
    console.log(
      "Es wurde kein Begrüßungskanal gefunden."
    );

    return;
  }

  const welcomeEmbed = new EmbedBuilder()
    .setColor("#c7ff18")
    .setTitle("Willkommen auf dem Server!")
    .setDescription(
      `Hey ${member}, schön, dass du auf **${member.guild.name}** dabei bist!`
    )
    .setThumbnail(
      member.user.displayAvatarURL({
        size: 256,
      })
    )
    .addFields({
      name: "Mitglied Nummer",
      value: `${member.guild.memberCount}`,
    })
    .setFooter({
      text: "Sentinel Begrüßungssystem",
    })
    .setTimestamp();

  await channel.send({
    content: `Willkommen ${member}! 👋`,
    embeds: [welcomeEmbed],
  });
});

client.login(process.env.DISCORD_TOKEN);