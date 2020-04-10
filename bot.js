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

const $pervert = [
    'https://www.reddit.com/r/rule34/',
    'https://exhentai.org',
    'https://e-hentai.org',
    'https://www.pixiv.net/tags/R-18',
    'https://nhentai.net'
]

const $messages = {
    'system': {
        'adminOnly': "That's an admin-only command.",
        'joinedList': "@{name} has joined the waiting list. There are {total} players awaiting a game.",
        'onWaitingList': "@{name}, you're already on the waiting list.",
        'onReadyList': "@{name}, you're already on a waiting table.",
        'onPlayingList': "@{name}, you're already in a game.",
        'leftList': "@{name} has left the waiting list. There are {total} players awaiting a game.",
        'notOnList': "@{name}, you're not on the waiting list.",
        'waitingTotal': "There are currently {total} players waiting for a match.",
        'waitingList': "Players awaiting a match - {list}",
        'reset': "All active lists have been reset.",
        'tableCreated': "A new table is ready - ID: {hash} --> players: {players}",
        'tableStarted': "The match with table ID {id} has been started.",
        'tableReady': "Ready table - ID: {hash} --> players: {players}",
        'tablePlaying': "Active table - ID: {hash} --> players: {players}",
        'tableNotFound': "I can't find that table...",
        'tableNotStarted': "You need to be on that table to start it.",
        'generatingTables': "Creating tables from current waiting list...",
        'generatingReady': "Listing tables from ready list...",
        'generatingPlaying': "Listing tables from playing list...",
        'noTables': "There are no tables in that list.",
        'notEnoughPlayers': "There are not enough players waiting to create a table.",
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
        'commandIncorrect': "I don't recognise that command...",
        'optionIncorrect': "I don't know that option...",
        'targetIncorrect': "I don't understand that request...",
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
            $client.say($target, utils.replaceString($messages.system.tableCreated, $data))
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
                    $data.players = utils.printArray($env.ready[$hash]);
                    setTimeout($message, ($timers.generate.seconds * $timers.generate.multiplier));
                    $timers.generate.multiplier = $timers.generate.multiplier + 1;
                    utils.generateTables(type, target);
                }
            }
        } else {
            return ($timers.generate.multiplier = 1);
        }
    }
}

/*
TO DO:
'lewds' -> update link and message object, hook into stringReplace
'notify' -> function body(?)
'join' -> if auto=true, check waiting>=4 and create table
'init' -> function body, setInterval, generate whenever waiting=4, set auto=true
'pause' -> function body, clearInterval
'timeout [type]' -> set auto = true/false, execute create [type]
*/

const fn = {
    'join': (target, data) => {
        // sign into waiting list to play
        const $inWaiting = utils.toBoolean(utils.findInArray($env.waiting, data.$name));
        const $inReady = utils.findInMatches($env.ready, data.$name);
        const $inPlaying = utils.findInMatches($env.playing, data.$name);
        let $data = { 'name': data.$name }

        if ($inWaiting) {
            return $client.say(target, utils.replaceString($messages.system.onWaitingList, $data));
        }

        if ($inReady) {
            return $client.say(target, utils.replaceString($messages.system.onReadyList, $data));
        }

        if ($inPlaying) {
            return $client.say(target, utils.replaceString($messages.system.onPlayingList, $data));
        }

        if (!$inWaiting && !$inReady && !$inPlaying) {
            $env.waiting.push(data.$name);
            $data.total = $env.waiting.length;
            return $client.say(target, utils.replaceString($messages.system.joinedList, $data));
        }
    },
    'leave': (target, data) => {
        // sign out of waiting list - DONE
        const $player = utils.toBoolean(utils.findInArray($env.waiting, data.$name));
        let $data = { 'name': data.$name }
        if ($player) {
            $env.waiting = utils.removeFromArray($env.waiting, data.$name);
            $data.total = $env.waiting.length;
            return $client.say(target, utils.replaceString($messages.system.leftList, $data));
        } else {
            return $client.say(target, utils.replaceString($messages.system.notOnList, $data));
        }
    },
    'list': (target, data) => {
        // check waiting lists
        if (data.$tgt === '-total') {
            return $client.say(target, utils.replaceString($messages.system.waitingTotal, { 'total': $env.waiting.length }));
        }

        if (data.$tgt === '-waiting') {
            let $list = utils.printArray($env.waiting);
            if ($list === '') { $list = '[no players]'; }
            return $client.say(target, utils.replaceString($messages.system.waitingList, { 'list': $list }));
        }

        if (data.$tgt === '-ready') {
            let $size = Object.keys($env.ready).length;
            if ($size !== 0) {
                $client.say(target, $messages.system.generatingReady);
                return utils.printMatches(target, $env.ready, $messages.system.tableReady);
            } else {
                $client.say(target, $messages.system.noTables);
            } 
        }

        if (data.$tgt === '-playing') {
            let $size = Object.keys($env.playing).length;
            if ($size !== 0) {
                $client.say(target, $messages.system.generatingPlaying);
                return utils.printMatches(target, $env.playing, $messages.system.tablePlaying);
            } else {
                $client.say(target, $messages.system.noTables);
            }
        }

        if (data.$tgt === null) {
            return $client.say(target, $messages.system.targetIncorrect);
        }
    },
    'play': (target, data) => {
        // init game start and move to active tables
        if (data.$tgt !== null) {
            const $id = utils.findInObject($env.ready, data.$tgt);
            if ($id) {
                let $player = utils.toBoolean(utils.findInArray($env.ready[data.$tgt], data.$name));
                if ($player) {
                    let $obj = $env.ready[data.$tgt];
                    utils.removeFromObject($env.ready, data.$tgt);
                    $env.playing[data.$tgt] = $obj;
                    setTimeout(function(){
                        utils.removeFromObject($env.playing, data.$tgt);
                    }, 300000);
                    return $client.say(target, utils.replaceString($messages.system.tableStarted, { 'id': data.$tgt }));
                } else {
                    return $client.say(target, $messages.system.tableNotStarted);
                }
            } else {
                return $client.say(target, $messages.system.tableNotFound);
            }
        }

        if (data.$tgt === null) {
            return $client.say(target, $messages.system.targetIncorrect);
        }
    },
    'lewds': (target, data) => {
        // post lewds lmao
    },
    'add': (target, data) => {
        // ADMIN ONLY - manually add a player to the waiting list
        if (data.$me && data.$tgt !== null) {
            const $inWaiting = utils.toBoolean(utils.findInArray($env.waiting, data.$tgt));
            const $inReady = utils.findInMatches($env.ready, data.$tgt);
            const $inPlaying = utils.findInMatches($env.playing, data.$tgt);
            let $data = { 'name': data.$tgt }

            if ($inWaiting) {
                return $client.say(target, utils.replaceString($messages.system.adminOnWaitingList, $data));
            }

            if ($inReady) {
                return $client.say(target, utils.replaceString($messages.system.adminOnReadyList, $data));
            }

            if ($inPlaying) {
                return $client.say(target, utils.replaceString($messages.system.adminOnPlayingList, $data));
            }

            if (!$inWaiting && !$inReady && !$inPlaying) {
                $env.waiting.push(data.$tgt);
                $data.total = $env.waiting.length;
                return $client.say(target, utils.replaceString($messages.system.adminAdd, $data));
            }
        }

        if (data.$me && data.$tgt === null) {
            return $client.say(target, $messages.system.adminAddName);
        }

        if (!data.$me) {
            return $client.say(target, $messages.system.adminOnly);
        }
    },
    'remove': (target, data) => {
        // ADMIN ONLY - manually remove a player (or all) from the waiting list
        if (data.$me && data.$tgt !== null) {
            if (data.$tgt === '-all') {
                $env.waiting = [];
                return $client.say(target, $messages.system.adminAllWaitingClosed);
            } else {
                const $player = utils.toBoolean(utils.findInArray($env.waiting, data.$tgt));
                let $data = { 'name': data.$tgt }
                if ($player) {
                    $env.waiting = utils.removeFromArray($env.waiting, data.$tgt);
                    $data.total = $env.waiting.length;
                    return $client.say(target, utils.replaceString($messages.system.adminRemove, $data));
                } else {
                    return $client.say(target, utils.replaceString($messages.system.adminNotOnList, $data));
                }
            }
        }

        if (data.$me && data.$tgt === null) {
            return $client.say(target, $messages.system.adminRemoveName);
        }

        if (!data.$me) {
            return $client.say(target, $messages.system.adminOnly);
        }
    },
    'closeready': (target, data) => {
        // ADMIN ONLY - close a waiting table (or all tables)
        if (data.$me && data.$tgt !== null) {
            if (data.$tgt === '-all') {
                $env.ready = {};
                return $client.say(target, $messages.system.adminAllReadyClosed);
            } else {
                const $inReady = utils.findInObject($env.ready, data.$tgt);
                if ($inReady) {
                    let $data = { 'id': data.$tgt };
                    utils.removeFromObject($env.ready, data.$tgt);
                    return $client.say(target, utils.replaceString($messages.system.adminTableClosed, $data));
                } else {
                    return $client.say(target, $messages.system.adminTableNotFound);
                }
            }
        }

        if (data.$me && data.$tgt !== null) {
            return $client.say(target, $messages.system.adminTableIDNeeded);
        }

        if (!data.$me) {
            return $client.say(target, $messages.system.adminOnly);
        }
    },
    'closeplaying': (target, data) => {
        // ADMIN ONLY - close a playing table (or all tables)
        if (data.$me && data.$tgt !== null) {
            if (data.$tgt === '-all') {
                $env.playing = {};
                return $client.say(target, $messages.system.adminAllPlayingClosed);
            } else {
                const $inPlaying = utils.findInObject($env.playing, data.$tgt);
                if ($inPlaying) {
                    let $data = { 'id': data.$tgt };
                    utils.removeFromObject($env.playing, data.$tgt);
                    return $client.say(target, utils.replaceString($messages.system.adminTableClosed, $data));
                } else {
                    return $client.say(target, $messages.system.adminTableNotFound);
                }
            }
        }

        if (data.$me && data.$tgt !== null) {
            return $client.say(target, $messages.system.adminTableIDNeeded);
        }

        if (!data.$me) {
            return $client.say(target, $messages.system.adminOnly);
        }
    },
    'start': (target, data) => {
        // ADMIN ONLY - init game start and move to active tables, bypassing name check
        if (data.$me) {
            if (data.$tgt !== null) {
                const $id = utils.findInObject($env.ready, data.$tgt);
                if ($id) {
                    let $obj = $env.ready[data.$tgt];
                    utils.removeFromObject($env.ready, data.$tgt);
                    $env.playing[data.$tgt] = $obj;
                    setTimeout(function () {
                        utils.removeFromObject($env.playing, data.$tgt);
                    }, 300000); // 5mins
                    return $client.say(target, utils.replaceString($messages.system.tableStarted, { 'id': data.$tgt }));
                } else {
                    return $client.say(target, $messages.system.tableNotFound);
                }
            }
    
            if (data.$tgt === null) {
                return $client.say(target, $messages.system.targetIncorrect);
            }
        }

        if (!data.$me) {
            return $client.say(target, $messages.system.adminOnly);
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

            return $client.say(target, $messages.system.reset);
        }

        if (!data.$me) {
            return $client.say(target, $messages.system.adminOnly);
        }
    },
    'notify': (target, data) => {
        // ADMIN ONLY - send a notification to a waiting table
        if (!data.$me) {
            return $client.say(target, $messages.system.adminOnly);
        }
    },
    'init': (target, data) => {
        // ADMIN ONLY - init command watching
        if (!data.$me) {
            return $client.say(target, $messages.system.adminOnly);
        }
    },
    'pause': (target, data) => {
        // ADMIN ONLY - stop command watching (excluding !batjong init)
        if (!data.$me) {
            return $client.say(target, $messages.system.adminOnly);
        }
    },
    'create': (target, data) => {
        // ADMIN ONLY - generate waiting tables using the current active player list
        if (data.$me && data.$tgt !== null) {
            if (data.$tgt === '-random' || data.$tgt === '-order') {
                if ($env.waiting.length >= 4) {
                    $client.say(target, $messages.system.generatingTables);
                    return utils.generateTables(data.$tgt, target);
                } else {
                    return $client.say(target, $messages.system.notEnoughPlayers);
                }
            } else {
                return $client.say(target, $messages.system.targetIncorrect);
            }
        }
        
        if (data.$me && data.$tgt === null) {
            return $client.say(target, $messages.system.adminTableSortNeeded);
        }

        if (!data.$me) {
            return $client.say(target, $messages.system.adminOnly);
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
            return $client.say(target, $messages.system.adminOnly);
        }
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
            $client.say(target, $messages.system.commandIncorrect);
        }
    } else if ($data.$cmd === process.env.BOT_COMMAND && $data.$opt === null) {
        $client.say(target, utils.randomSelect($messages.silly));
    }

    console.log('msg', $msg);
    console.log('env', $env);
    console.log('data', $data);
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
}

// Register our event handlers (defined below)
$client.on('message', onMessageHandler);
$client.on('connected', onConnectedHandler);