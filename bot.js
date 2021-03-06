const Discord = require("discord.js");
const fs = require("fs");

const client = new Discord.Client({disabledEvents:[
	"GUILD_SYNC",
	"GUILD_MEMBERS_CHUNK",
	"GUILD_INTEGRATIONS_UPDATE",
	"GUILD_BAN_ADD",
	"GUILD_BAN_REMOVE",
	"CHANNEL_PINS_UPDATE",
	"USER_UPDATE",
	"USER_NOTE_UPDATE",
	"USER_SETTINGS_UPDATE",
	"PRESENCE_UPDATE",
	"VOICE_STATE_UPDATE",
	"TYPING_START",
	"VOICE_SERVER_UPDATE",
	"RELATIONSHIP_ADD",
	"RELATIONSHIP_REMOVE",
	"WEBHOOKS_UPDATE"
]});
const core = require("./coreFunctions.js");
const { connect, connection } = require("mongoose");
const autoIncrement = require("mongoose-sequence");

connect(process.env.MONGO, {
	useNewUrlParser: true,
	useUnifiedTopology: true
})
	.catch((err) => {
		throw new Error(err);
	});

autoIncrement(connection);

connection.on("open", () => {
	console.log("Connected to MongoDB!");
});
connection.on("error", (err) => {
	console.error("Connection error: ", err);
});

fs.readdir("./events/", (err, files) => {
	files.forEach(file => {
		const eventHandler = require(`./events/${file}`);
		const eventName = file.split(".")[0];

		client.on(eventName, (...args) => {
			try {
				eventHandler(Discord, client, ...args);
			} catch (err) {
				core.errorLog(err, "Event Handler", `Event: ${eventName}`);
			}

		});
	});
});

client.login(process.env.TOKEN)
	.catch((err) => {
		throw new Error(err);
	});

// core.errorLog(err, type, footer)
client.on("error", (err) => {
	core.errorLog(err, "error", "something happened and idk what");
});
client.on("warn", (warning) => {
	console.warn(warning);
});
process.on("unhandledRejection", (err) => { // this catches unhandledPromiserejectionWarning and other unhandled rejections
	core.errorLog(err, "unhandledRejection", "oof something is broken x.x");
});
