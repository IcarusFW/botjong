# botjong
A Twitch chatbot for organising riichi mahjong matches

## Setting up
This bot is set up using NodeJS, and therefore requires a local instance of Node to be run. As usual, `cmd` into the project root and execute `npm install` to install all dependencies, then tell Node to execute `bot.js`.
For this to be functional, a `.env` file with the parameters `BOT_USERNAME`, `BOT_COMMAND`, `OAUTH_TOKEN`, `CHANNEL_NAME` and `ME` is required in the root of the project. This repo will not have one committed to code for personal data security purposes.

## Commands
All Botjong commands start with the command listed in `.env.BOT_COMMAND` followed by a request and an optional target. 

### Public Commands
- `join` : adds your name to the waiting list - you can also use `!batjoin` as a shortcut
- `leave` : removes your name from the waiting list
- `list OR list -waiting` : displays the names of all of the waiting players
- `list -total` : displays the total number of players on the waiting list
- `list -ready` : lists all of the tables waiting to start
- `list -playing` :  lists all of the tables with active games
- `play` : tell the bot to start your ready table
- `play [room]` : tell the bot your ready table has the [room] number and start the match
- `notify [room]` : notify a table with the MJS [room] number
- `lewds` : randomly generate a lewd link (you perverts) - invisible timer controlled to avoid link spam
- `help` : returns a link to a list of commands for this bot

### Admin Only Commands
- `add [name]` : add a player to the waiting list
- `remove [name]` : remove a player from the waiting list
- `remove -all` : remove all players from the waiting list
- `closeready [id]` : remove a table from the waiting list
- `closeready -all` : remove all tables from the waiting list
- `closeplaying [id]` : remove a table from the playing list
- `closeplaying -all` : remove all tables from the playing list
- `start [id]` : start a table
- `reset` : empty all tracking lists
- `create [-order/-random]` : automatically try to create tables with the current waiting list
- `auto [-on/-off]` : set autogen checking flag on/off -> joining will either trigger a tablegen check or tablegen is manual
- `type [-order/-random]` : set tablegen type flag -> order creates tables in join order, random is random, only applies when auto=true
- `log` : output all tracking lists to `console.log()`

This bot, when set to `auto -on`, will check the number of players joining, and when there is enough for a table, will automatically generate the table. `auto` can be turned `-off`, and table generation can be done manually if a `-random` sorting order is preferred - this is good for large groups of players starting matches at the same time. Waiting room size check may be command-set in the future to determine what size the waiting room should be at before automatic table generation is triggered.

The intention for this bot is to track any waiting players and automatically create a table ID once there is enough to make a table. As there is no way to hook into MJS to create a table and assign player IDs, all table creation must be handled manually - the bot is for tracking players and games only. Players _must_ reregister for a match whenever they are ready, and `leave` if they no longer wish to be tracked for a match.