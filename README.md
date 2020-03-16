# botjong
A Twitch chatbot for organising riichi mahjong matches

## Setting up
This bot is set up using NodeJS, and therefore requires a local instance of Node to be run. As usual, `cmd` into the project root and execute `npm install` to install all dependencies, then tell Node to execute `bot.js`.
For this to be functional, a `.env` file with the parameters `BOT_USERNAME`, `OAUTH_TOKEN`, `CHANNEL_NAME` and `ME` are required in the root of the project. This repo will not have one committed to code for personal data security purposes.

## Commands
All Botjong commands start with `!botjong` followed by a request and an optional target. 

### Public Commands
- `join` : adds your name to the waiting list
- `leave` : removes your name from the waiting list
- `list -total` : displays the total number of players on the waiting list
- `list -waiting` : displays the names of all of the waiting players
- `list -ready` : lists all of the tables waiting to start
- `list -playing` :  lists all of the tables with active games
- `play [id]` : tell the bot that table [id] has started their match
- `lewds` : randomly generate a lewd link (you perverts)

### Admin Only Commands
- `add [name]` : add a player to the waiting list
- `remove [name]` : remove a player from the waiting list
- `remove -all` : remove all players from the waiting list
- `close [id]` : remove a table from the waiting list
- `close -all` : remove all tables from the waiting list
- `reset` : empty all tracking lists
- `notify [id]` : notify a waiting table to start their game
- `start` : tell bot to start tracking all commands
- `stop` : tell bot to stop watching for all commands except `start`
- `generate` : automatically try to create tables with the current waiting list
- `log` : output all tracking lists to `console.log()`

Note that the bot has a `setInterval()` where it will automatically execute `generate` and `notify` to create tables if there are enough players in the waiting list, along with `remove [name]` to keep the list itself clean. The active games list will have an Epoch timestamp set on each generated table, and each active table will be purged once a set amount of time has elapsed, to keep things clean.

The intention for this bot is to track any waiting players and automatically create a table ID once there is enough to make a table. As tehre is no way to hook into MJS to create a table and assign player IDs, all table creation must be handled manually - the bot is for tracking players and games only. Players _must_ reregister for a match whenever they are ready, and `leave` if they no longer wish to be tracked for a match.