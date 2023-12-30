const dotenv = require("dotenv");
dotenv.config();
const guid = process.env.GUILD_ID;
const appname = process.env.APP_NAME;

const express = require("express");
const app = express();

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/views/assets"));

const {
    Events,
    Client,
    GatewayIntentBits,
    ActivityType,
} = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
    ],
});

client.on("ready", () => {
    client.user.setStatus("idle");
    client.user.setActivity(
        `${client.guilds.cache
            .reduce((a, b) => a + b.memberCount, 0)
            .toLocaleString()} users`,
        {
            type: ActivityType.Watching,
        }
    );
    console.log(`bot ready! `);
});

app.get("/user/:uid", async (req, res) => {
    const uid = req.params.uid;

    if (!uid || isNaN(uid))
        return res.status(404).json({
            error: "Please enter the ID of the user on the bot's server. ",
        });
    try {
        const guild = await client.guilds.fetch(guid);
        const user = await guild.members.fetch(uid);

        res.render("./user.ejs", {
            user: user.user,
            appname: appname,
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/api/user/:uid", async (req, res) => {
    const uid = req.params.uid;
    if (!uid || isNaN(uid))
        return res.status(404).json({
            error: "Please enter the ID of the user on the bot's server. ",
        });

    try {
        const guild = await client.guilds.fetch(guid);
        const user = await guild.members.fetch(uid);
        const userData = {
            nickname: user.user.username,
            displayname: user.user.globalName,
            presence: user.user.presence,
            avatar: user.user.displayAvatarURL({ dynamic: true }),
        };

        res.json(userData);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

client.login(process.env.TOKEN);
app.listen(process.env.PORT, () => {
    console.log(`server port opened.`);
});
