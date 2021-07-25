const $tmi = require('tmi.js');

// Define configuration options
const $opts = {
    identity: {
        username: process.env.BOT_USERNAME,
        password: process.env.OAUTH_TOKEN
    },
    channels: [process.env.CHANNEL_NAME]
};

// Create a client with our options
const $client = new $tmi.client($opts);

// Connect to Twitch:
$client.connect();

// set up environment object
let $env = {
    'auto': true,
    'type': '-order',
    'waiting': [],
    'ready': {},
    'playing': {}
}

let $timers = {
    'generate': {
        'seconds': 1500,
        'multiplier': 1
    },
    'list': {
        'seconds': 1500,
        'multiplier': 0
    }
}

const $pervert = {
    'timer': false,
    'message': [
        'BatJong {link} - and keep the change, you filthy animal.'
    ],
    'links': [
        'https://www.reddit.com/r/rule34/',
        'https://exhentai.org',
        'https://e-hentai.org',
        'https://www.pixiv.net/tags/R-18',
        'https://nhentai.net',
        'https://www.fakku.net/',
        'https://hentairead.com/',
        'https://hentaifox.com/',
        'https://9hentai.com/'
    ]
}

const $messages = {
    'system': {
        'players': {
            'joining': "@{name} has joined the waiting list. There are {total} players awaiting a game.",
            'onWaiting': "@{name}, you're already on the waiting list.",
            'onReady': "@{name}, you're already on a waiting table.",
            'onPlaying': "@{name}, you're already in a game.",
            'leaving': "@{name} has left the waiting list. There are {total} players awaiting a game.",
            'notOnList': "@{name}, you're not on the waiting list."
        },
        'tables': {
            'generatingTables': "Creating tables from current waiting list...",
            'generatingComplete': "Table generation completed. There are {total} unsorted players still waiting.",
            'tableCreated': "A new table is ready - ID: {hash} --> players: {players}",
            'tableStarted': "The match with table ID {id} has been started.",
            'tableStartedWithID': "The match with table ID {id} has been started. The room number for MJS is {room} -> {players}",
            'tableNotFound': "There are no tables ready to play.",
            'tablesNotAvailable': "There are no tables ready to play or in progress.",
            'tableNotStarted': "You need to be on a table to start it.",
            'tableNotNotified': "You need to be on a table to send a room notification.",
            'sendNotification': "The room number for MJS is {room} -> {players}",
            'notEnoughPlayers': "There are not enough players waiting to create a table."
        },
        'list': {
            'waitingTotal': "There are currently {total} players waiting for a match.",
            'waitingList': "Players awaiting a match - {list}",
            'generatingReady': "Listing tables from ready list...",
            'tableReady': "Ready table - ID: {hash} --> players: {players}",
            'generatingPlaying': "Listing tables from playing list...",
            'tablePlaying': "Active table - ID: {hash} --> players: {players}",
            'noTables': "There are no tables in that list."
        },
        'admin': {
            'reset': "All active lists have been reset.",
            'adminAdd': "@{name} has been added to the waiting list. There are {total} players awaiting a game.",
            'adminAddName': "You need to provide a player name to add to the list.",
            'adminOnWaitingList': "@{name} is already on the waiting list.",
            'adminOnReadyList': "@{name} is already on a waiting table.",
            'adminOnPlayingList': "@{name} is already in a game.",
            'adminRemove': "@{name} has been removed from the waiting list. There are {total} players awaiting a game.",
            'adminRemoveName': "You need to provide a player name to remove from the list.",
            'adminNotOnList': "@{name} is not on the waiting list.",
            'adminAllWaitingClosed': "All players removed from the waiting list.",
            'adminAllReadyClosed': "All waiting tables have been closed.",
            'adminAllPlayingClosed': "All playing tables have been closed.",
            'adminTableClosed': "The table with id: {id} has been closed.",
            'adminTableNotFound': "I could not find a table with that id...",
            'adminTableIDNeeded': "You need to provide a table id.",
            'adminTableSortNeeded': "You need to provide a table sorting type.",
            'adminTableSortChanged': "Table sorting type: {type}",
            'adminAutoNeeded': "You need to turn automatic generation on or off.",
            'adminAutoChanged': "Automatic table creation: {auto}"
        },
        'error': {
            'adminOnly': "That's an admin-only command.",
            'commandIncorrect': "I don't recognise that command...",
            'optionIncorrect': "I don't know that option...",
            'targetIncorrect': "I don't understand that request..."
        },
        'other': {
            'help': "Join the waiting list with '!batjoin' or '!batjong join'. Leave the list with '!batjong leave'. Start a match with '!batjong play [room number]' (no square brackets). Other bot commands at https://github.com/IcarusFW/botjong"
        }
    },
    'silly': [
        'BatJong I am the night.',
        'BatJong I am whatever mahjong needs me to be.',
        'BatJong Batjong has no limits.',
        'BatJong It’s not what uradora I am but what I pon that defines me.',
        'BatJong Sometimes it’s only furiten that makes us what we are.',
        'BatJong You either deal-in a hero, or you live long enough to see yourself become the drawn game.',
        'BatJong You’re not the yakuman. You’re practice.',
        'BatJong Riichis frighten me. It’s time the world shared my dread.',
        'BatJong I have no yaku, but I must pon.',
        'BatJong Memes never die, they just get postponed to a future match.',
        'PonChamp',
        'Chiisus',
        'YesWeKan',
        'AngryMiku'
    ]
}

const utils = {
    'isMe': (name) => { return (name === process.env.ME) ? true : false; },
    'getHash': () => { return Math.random().toString(36).substr(2, 5); },
    'findInArray': (obj, name) => {
        return obj.find(function (e) {
            return (e === name);
        });
    },
    'findInObject': (obj, name) => {
        return obj.hasOwnProperty(name);
    },
    'findInMatches': (obj, name) => {
        if (obj.length !== 0) {
            for (let key in obj) {
                if (utils.toBoolean(utils.findInArray(obj[key], name))) {
                    return true;
                }
            }
            return false;
        } else {
            return false;
        }
    },
    'toBoolean': (itm) => {
        return Boolean(itm);
    },
    'removeFromArray': (obj, name) => {
        return obj.filter(val => val !== name);
    },
    'removeFromObject': (obj, name) => {
        return delete obj[name];
    },
    'printArray': (obj) => {
        let $temp = '';
        for (let i = 0; i < obj.length; i++) {
            $temp += (i !== 0) ? ', ' : '';
            $temp += obj[i];
        }
        return $temp;
    },
    'printArrayWithAt': (obj) => {
        let $temp = '';
        for (let i = 0; i < obj.length; i++) {
            $temp += (i !== 0) ? ', ' : '';
            $temp += ('@' + obj[i]);
        }
        return $temp;
    },
    'printMatches': (target, obj, message) => {
        let $data = {};
        let $index = 0;
        let $size = Object.keys(obj).length;
        let $message = () => {
            $client.say(target, utils.replaceString(message, $data))
        }
        for (let key in obj) {
            $index = $index + 1;
            $timers.list.multiplier = $timers.list.multiplier + 1;
            $data = {
                'hash': key,
                'players': utils.printArray(obj[key])
            };
            setTimeout($message, ($timers.list.seconds * $timers.list.multiplier));
            if ($index === $size) {
                $timers.list.multiplier = 0;
            }
        }
    },
    'replaceString': (itm, obj) => {
        let $temp = itm;
        for (let key in obj) {
            $temp = $temp.replace(`{${key}}`, obj[key]);
        }
        return $temp;
    },
    'randomSelect': (arr) => {
        return arr[Math.floor(Math.random() * arr.length)]
    },
    'generateTables': (type, target) => {
        let $data = {};
        let $target = target;
        let $message = () => {
            $client.say($target, utils.replaceString($messages.system.tables.tableCreated, $data))
        }
        let $complete = () => {
            $client.say(target, utils.replaceString($messages.system.tables.generatingComplete, { 'total': $env.waiting.length }));
        }

        if ($env.waiting.length >= 4) {
            let $table = [];
            for (let i = 1; i <= 4; i++) {
                let $name = (type === '-order') ? $env.waiting[0] : utils.randomSelect($env.waiting);
                $table.push($name);
                $env.waiting = utils.removeFromArray($env.waiting, $name);

                if (i === 4) {
                    let $hash = utils.getHash();
                    $env.ready[$hash] = $table;
                    $data.hash = $hash;
                    $data.players = utils.printArrayWithAt($env.ready[$hash]);
                    setTimeout($message, ($timers.generate.seconds * $timers.generate.multiplier));
                    $timers.generate.multiplier = $timers.generate.multiplier + 1;
                    utils.generateTables(type, target);
                }
            }
        } else {
            setTimeout($complete, ($timers.generate.seconds * $timers.generate.multiplier));
            return ($timers.generate.multiplier = 1);
        }
    },
    'startMatch': (target, data, key) => {
        let $obj = $env.ready[key];
        utils.removeFromObject($env.ready, key);
        $env.playing[key] = $obj;
        setTimeout(function () {
            utils.removeFromObject($env.playing, key);
        }, 300000);
        if (data.$tgt !== null) {
            let $data = {
                'id': key,
                'room': data.$tgt,
                'players': utils.printArrayWithAt($env.playing[key])
            }
            return $client.say(target, utils.replaceString($messages.system.tables.tableStartedWithID, $data));
        } else {
            return $client.say(target, utils.replaceString($messages.system.tables.tableStarted, { 'id': key }));
        }
    },
    'sendNotification': (target, data, array, key) => {
        let $data = {
            'room': data.$tgt,
            'players': utils.printArrayWithAt(array[key])
        }
        return $client.say(target, utils.replaceString($messages.system.tables.sendNotification, $data));
    }
}

const fn = {
    'join': (target, data) => {
        // sign into waiting list to play
        const $inWaiting = utils.toBoolean(utils.findInArray($env.waiting, data.$name));
        const $inReady = utils.findInMatches($env.ready, data.$name);
        const $inPlaying = utils.findInMatches($env.playing, data.$name);
        let $data = { 'name': data.$name }
        let $generate = () => {
            return utils.generateTables($env.type, target);
        }

        if ($inWaiting) {
            return $client.say(target, utils.replaceString($messages.system.players.onWaiting, $data));
        }

        if ($inReady) {
            return $client.say(target, utils.replaceString($messages.system.players.onReady, $data));
        }

        if ($inPlaying) {
            return $client.say(target, utils.replaceString($messages.system.players.onPlaying, $data));
        }

        if (!$inWaiting && !$inReady && !$inPlaying) {
            $env.waiting.push(data.$name);
            $data.total = $env.waiting.length;
            $client.say(target, utils.replaceString($messages.system.players.joining, $data));

            if ($env.waiting.length >= 4 && $env.auto === true) {
                $client.say(target, $messages.system.tables.generatingTables);
                setTimeout($generate, ($timers.generate.seconds * $timers.generate.multiplier));
                return ($timers.generate.multiplier = $timers.generate.multiplier + 1);
            }
        }
    },
    'leave': (target, data) => {
        // sign out of waiting list - DONE
        const $player = utils.toBoolean(utils.findInArray($env.waiting, data.$name));
        let $data = { 'name': data.$name }
        if ($player) {
            $env.waiting = utils.removeFromArray($env.waiting, data.$name);
            $data.total = $env.waiting.length;
            return $client.say(target, utils.replaceString($messages.system.players.leaving, $data));
        } else {
            return $client.say(target, utils.replaceString($messages.system.players.notOnList, $data));
        }
    },
    'list': (target, data) => {
        // check waiting lists
        if (data.$tgt === null || data.$tgt === '-waiting') {
            let $list = utils.printArray($env.waiting);
            if ($list === '') { $list = '[no players]'; }
            return $client.say(target, utils.replaceString($messages.system.list.waitingList, { 'list': $list }));
        }

        if (data.$tgt === '-total') {
            return $client.say(target, utils.replaceString($messages.system.list.waitingTotal, { 'total': $env.waiting.length }));
        }

        if (data.$tgt === '-ready') {
            let $size = Object.keys($env.ready).length;
            if ($size !== 0) {
                $client.say(target, $messages.system.list.generatingReady);
                return utils.printMatches(target, $env.ready, $messages.system.list.tableReady);
            } else {
                $client.say(target, $messages.system.list.noTables);
            } 
        }

        if (data.$tgt === '-playing') {
            let $size = Object.keys($env.playing).length;
            if ($size !== 0) {
                $client.say(target, $messages.system.list.generatingPlaying);
                return utils.printMatches(target, $env.playing, $messages.system.list.tablePlaying);
            } else {
                $client.say(target, $messages.system.list.noTables);
            }
        }
    },
    'play': (target, data) => {
        // init game start and move to active tables
        if ($env.ready.length !== 0) {
            let $player = null;
            for (let key in $env.ready) {
                $player = utils.toBoolean(utils.findInArray($env.ready[key], data.$name));

                if ($player) {
                    return utils.startMatch(target, data, key);
                }
            }

            if (!$player) {
                return $client.say(target, $messages.system.tables.tableNotStarted);
            }
        } else {
            return $client.say(target, $messages.system.tables.tableNotFound);
        }
    },
    'lewds': (target, data) => {
        // post lewds lmao
        if ($pervert.timer === false) {
            $pervert.timer = true;
            const $message = utils.randomSelect($pervert.message);
            const $link = utils.randomSelect($pervert.links);
            setTimeout(function () {
                $pervert.timer = false;
            }, 900000);
            return $client.say(target, utils.replaceString($message, {'link': $link}));
        }
    },
    'add': (target, data) => {
        // ADMIN ONLY - manually add a player to the waiting list
        if (data.$me && data.$tgt !== null) {
            const $inWaiting = utils.toBoolean(utils.findInArray($env.waiting, data.$tgt));
            const $inReady = utils.findInMatches($env.ready, data.$tgt);
            const $inPlaying = utils.findInMatches($env.playing, data.$tgt);
            let $data = { 'name': data.$tgt }

            if ($inWaiting) {
                return $client.say(target, utils.replaceString($messages.system.admin.adminOnWaitingList, $data));
            }

            if ($inReady) {
                return $client.say(target, utils.replaceString($messages.system.admin.adminOnReadyList, $data));
            }

            if ($inPlaying) {
                return $client.say(target, utils.replaceString($messages.system.admin.adminOnPlayingList, $data));
            }

            if (!$inWaiting && !$inReady && !$inPlaying) {
                $env.waiting.push(data.$tgt);
                $data.total = $env.waiting.length;
                return $client.say(target, utils.replaceString($messages.system.admin.adminAdd, $data));
            }
        }

        if (data.$me && data.$tgt === null) {
            return $client.say(target, $messages.system.admin.adminAddName);
        }

        if (!data.$me) {
            return $client.say(target, $messages.system.error.adminOnly);
        }
    },
    'remove': (target, data) => {
        // ADMIN ONLY - manually remove a player (or all) from the waiting list
        if (data.$me && data.$tgt !== null) {
            if (data.$tgt === '-all') {
                $env.waiting = [];
                return $client.say(target, $messages.system.admin.adminAllWaitingClosed);
            } else {
                const $player = utils.toBoolean(utils.findInArray($env.waiting, data.$tgt));
                let $data = { 'name': data.$tgt }
                if ($player) {
                    $env.waiting = utils.removeFromArray($env.waiting, data.$tgt);
                    $data.total = $env.waiting.length;
                    return $client.say(target, utils.replaceString($messages.system.admin.adminRemove, $data));
                } else {
                    return $client.say(target, utils.replaceString($messages.system.admin.adminNotOnList, $data));
                }
            }
        }

        if (data.$me && data.$tgt === null) {
            return $client.say(target, $messages.system.admin.adminRemoveName);
        }

        if (!data.$me) {
            return $client.say(target, $messages.system.error.adminOnly);
        }
    },
    'closeready': (target, data) => {
        // ADMIN ONLY - close a waiting table (or all tables)
        if (data.$me && data.$tgt !== null) {
            if (data.$tgt === '-all') {
                $env.ready = {};
                return $client.say(target, $messages.system.admin.adminAllReadyClosed);
            } else {
                const $inReady = utils.findInObject($env.ready, data.$tgt);
                if ($inReady) {
                    let $data = { 'id': data.$tgt };
                    utils.removeFromObject($env.ready, data.$tgt);
                    return $client.say(target, utils.replaceString($messages.system.admin.adminTableClosed, $data));
                } else {
                    return $client.say(target, $messages.system.admin.adminTableNotFound);
                }
            }
        }

        if (data.$me && data.$tgt === null) {
            return $client.say(target, $messages.system.admin.adminTableIDNeeded);
        }

        if (!data.$me) {
            return $client.say(target, $messages.system.error.adminOnly);
        }
    },
    'closeplaying': (target, data) => {
        // ADMIN ONLY - close a playing table (or all tables)
        if (data.$me && data.$tgt !== null) {
            if (data.$tgt === '-all') {
                $env.playing = {};
                return $client.say(target, $messages.system.admin.adminAllPlayingClosed);
            } else {
                const $inPlaying = utils.findInObject($env.playing, data.$tgt);
                if ($inPlaying) {
                    let $data = { 'id': data.$tgt };
                    utils.removeFromObject($env.playing, data.$tgt);
                    return $client.say(target, utils.replaceString($messages.system.admin.adminTableClosed, $data));
                } else {
                    return $client.say(target, $messages.system.admin.adminTableNotFound);
                }
            }
        }

        if (data.$me && data.$tgt === null) {
            return $client.say(target, $messages.system.admin.adminTableIDNeeded);
        }

        if (!data.$me) {
            return $client.say(target, $messages.system.error.adminOnly);
        }
    },
    'start': (target, data) => {
        // ADMIN ONLY - init game start and move to active tables, bypassing name check
        if (data.$me && data.$tgt !== null) {
            const $id = utils.findInObject($env.ready, data.$tgt);
            if ($id) {
                let $obj = $env.ready[data.$tgt];
                utils.removeFromObject($env.ready, data.$tgt);
                $env.playing[data.$tgt] = $obj;
                setTimeout(function () {
                    utils.removeFromObject($env.playing, data.$tgt);
                }, 300000); // 5mins
                return $client.say(target, utils.replaceString($messages.system.tables.tableStarted, { 'id': data.$tgt }));
            } else {
                return $client.say(target, $messages.system.tables.tableNotFound);
            }
        }

        if (data.$me && data.$tgt === null) {
            return $client.say(target, $messages.system.error.targetIncorrect);
        }

        if (!data.$me) {
            return $client.say(target, $messages.system.error.adminOnly);
        }
    },
    'reset': (target, data) => {
        // ADMIN ONLY - reset both wait list and wait tables to init state
        if (data.$me) {
            $env.waiting = [];
            $env.ready = {};
            $env.playing = {};

            $timers = {
                'generate': {
                    'seconds': 1500,
                    'multiplier': 1
                },
                'list': {
                    'seconds': 1500,
                    'multiplier': 0
                }
            }

            return $client.say(target, $messages.system.admin.reset);
        }

        if (!data.$me) {
            return $client.say(target, $messages.system.error.adminOnly);
        }
    },
    'notify': (target, data) => {
        // send a notification to a waiting table with a room number to join
        if ($env.ready.length !== 0) {
            let $inReady = false;
            let $inPlaying = false;

            for (let key in $env.ready) {
                $inReady = utils.toBoolean(utils.findInArray($env.ready[key], data.$name));
                if ($inReady) { 
                    return utils.sendNotification(target, data, $env.ready, key);
                }
            }

            for (let key in $env.playing) {
                $inPlaying = utils.toBoolean(utils.findInArray($env.playing[key], data.$name));
                if ($inPlaying) {
                    return utils.sendNotification(target, data, $env.playing, key);
                }
            }

            if (!$inReady && !$inPlaying) {
                return $client.say(target, $messages.system.tables.tableNotNotified);
            }
        } else {
            return $client.say(target, $messages.system.tables.tablesNotAvailable);
        }
    },
    'create': (target, data) => {
        // ADMIN ONLY - generate waiting tables using the current active player list
        if (data.$me && data.$tgt !== null) {
            if (data.$tgt === '-random' || data.$tgt === '-order') {
                if ($env.waiting.length >= 4) {
                    $client.say(target, $messages.system.tables.generatingTables);
                    return utils.generateTables(data.$tgt, target);
                } else {
                    return $client.say(target, $messages.system.tables.notEnoughPlayers);
                }
            } else {
                return $client.say(target, $messages.system.error.targetIncorrect);
            }
        }
        
        if (data.$me && data.$tgt === null) {
            return $client.say(target, $messages.system.admin.adminTableSortNeeded);
        }

        if (!data.$me) {
            return $client.say(target, $messages.system.error.adminOnly);
        }
    },
    'type': (target, data) => {
        // ADMIN ONLY - table sort type when auto -> order/random
        if (data.$me && data.$tgt !== null) {
            if (data.$tgt === '-random' || data.$tgt === '-order') {
                $env.type = data.$tgt;
                return $client.say(target, utils.replaceString($messages.system.admin.adminTableSortChanged, { 'type': data.$tgt }));
            } else {
                return $client.say(target, $messages.system.error.targetIncorrect);
            }
        }

        if (data.$me && data.$tgt === null) {
            return $client.say(target, $messages.system.admin.adminTableSortNeeded);
        }

        if (!data.$me) {
            return $client.say(target, $messages.system.error.adminOnly);
        }
    },
    'auto': (target, data) => {
        // ADMIN ONLY - set autogen table if join and waiting=4, else manual tablegen
        if (data.$me && data.$tgt !== null) {
            if (data.$tgt === '-on') {
                $env.auto = true;
                return $client.say(target, utils.replaceString($messages.system.admin.adminAutoChanged, { 'auto': 'on' }));
            } else if (data.$tgt === '-off') {
                $env.auto = false;
                return $client.say(target, utils.replaceString($messages.system.admin.adminAutoChanged, { 'auto': 'off' }));
            } else {
                return $client.say(target, $messages.system.error.targetIncorrect);
            }
        }

        if (data.$me && data.$tgt === null) {
            return $client.say(target, $messages.system.admin.adminAutoNeeded);
        }

        if (!data.$me) {
            return $client.say(target, $messages.system.error.adminOnly);
        }
    },
    'log': (target, data) => {
        // ADMIN ONLY - output all tracking lists to console - DONE
        if (data.$me) {
            console.log('msg', [data.$cmd, data.$opt, data.$tgt]);
            console.log('env', $env);
            console.log('data', data);
            console.log('timers', $timers);
        }

        if (!data.$me) {
            return $client.say(target, $messages.system.error.adminOnly);
        }
    },
    'help': (target, data) => {
        return $client.say(target, $messages.system.other.help);
    }
}

// Called every time a message comes in
function onMessageHandler(target, context, msg, self) {

    // remove whitespace from chat message and split
    const $msg = msg.trim().split(" ");

    // compile data object for functions
    let $data = {
        $name: context.username,
        $mod: context.mod,
        $cmd: $msg[0],
        $opt: $msg[1] || null,
        $tgt: $msg[2] || null
    }
    // additional personal check
    $data.$me = utils.isMe($data.$name);

    // Ignore messages from the bot
    if (self) { return; }

    // if the command is called, check validity of option and execute function if valid
    if ($data.$cmd === process.env.BOT_COMMAND && $data.$opt !== null) {
        if (typeof fn[$data.$opt] !== 'undefined') {
            fn[$data.$opt](target, $data);
        } else {
            $client.say(target, $messages.system.error.commandIncorrect);
        }
    } else if ($data.$cmd === '!batjoin') {
        // joining command shortcut
        fn.join(target, $data);
    } else if ($data.$cmd === process.env.BOT_COMMAND && $data.$opt === null) {
        $client.say(target, utils.randomSelect($messages.silly));
    }

    console.log('env', $env);
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
}

// Register our event handlers (defined below)
$client.on('message', onMessageHandler);
$client.on('connected', onConnectedHandler);