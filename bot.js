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

const $pervert = [
    'https://www.reddit.com/r/rule34/',
    'https://exhentai.org',
    'https://e-hentai.org',
    'https://www.pixiv.net/tags/R-18'
]

const $messages = {
    'adminOnly': "BatJong That's an admin-only command.",
    'joinedList': "BatJong @{name} has joined the waiting list. There are {total} players awaiting a game.",
    'onList': "BatJong @{name}, you're already on the waiting list.",
    'leftList': "BatJong @{name} has left the waiting list. There are {total} players awaiting a game.",
    'notOnList': "BatJong @{name}, you're not on the waiting list.",
    'waitingTotal': "BatJong There are currently {total} players waiting for a match.",
    'waitingList': "BatJong Players awaiting a match - {list}",
    'reset': "BatJong All active lists have been reset.",
    'adminAdd': "BatJong @{name} has been added to the waiting list. There are {total} players awaiting a game.",
    'adminAddName': "BatJong You need to provide a player name to add to the list.",
    'adminOnList': "BatJong @{name} is already on the waiting list.",
    'adminRemove': "Batjong @{name} has been removed from the waiting list. There are {total} players awaiting a game.",
    'adminRemoveName': "BatJong You need to provide a player name to remove from the list.",
    'adminNotOnList': "BatJong @{name} is not on the waiting list.",
    'commandIncorrect': "BatJong I don't recognise that command...",
    'optionIncorrect': "BatJong I don't know that option...",
    'targetIncorrect': "BatJong I don't understand that request...",
}

const isMe = (name) => { return (name === process.env.ME) ? true : false; }
const getHash = () => Math.random().toString(36).substr(2, 5);
const findInObject = (obj, name) => {
    return obj.find(function(e){
        return (e === name);
    });
}
const toBoolean = (itm) => {
    return Boolean(itm);
}
const removeFromArray = (obj, name) => {
    return obj.filter(val => val !== name);
}
const replaceString = (itm, obj) => {
    let $temp = itm;
    for (let key in obj) {
        $temp = $temp.replace(`{${key}}`, obj[key]);
    }
    return $temp;
}
const randomSelect = (arr) => {
    return arr[Math.floor(Math.random() * arr.length)]
}
const generateTables = () => {
    if ($env.waiting.length >= 4) {
        let $table = [];
        for (var i = 1; i <= 4; i++) {
            var $name = randomSelect($env.waiting);
            $table.push($name);
            $env.waiting = removeFromArray($env.waiting, $name);

            if (i === 4) {
                var $hash = getHash();
                $env.ready[$hash] = $table;
                generateTables();
            }
        }
    }
}

const fn = {
    'join': (target, data) => {
        // sign into waiting list to play
        const $player = toBoolean(findInObject($env.waiting, data.$name));
        let $data = { 'name': data.$name }
        if (!$player) {
            $env.waiting.push(data.$name);
            $data.total = $env.waiting.length;
            $client.say(target, replaceString($messages.joinedList, $data));
        } else {
            $client.say(target, replaceString($messages.onList, $data));
        }
    },
    'leave': (target, data) => {
        // sign out of waiting list
        const $player = toBoolean(findInObject($env.waiting, data.$name));
        let $data = { 'name': data.$name }
        if ($player) {
            $env.waiting = removeFromArray($env.waiting, data.$name);
            $data.total = $env.waiting.length;
            $client.say(target, replaceString($messages.leftList, $data));
        } else {
            $client.say(target, replaceString($messages.notOnList, $data));
        }
    },
    'list': (target, data) => {
        // check waiting lists
        if (data.$tgt === '-total') {
            $client.say(target, replaceString($messages.waitingTotal, {'total': $env.waiting.length}));
        }
        
        if (data.$tgt === '-waiting') {
            let $list = '';
            for (var i = 0; i < $env.waiting.length; i++) {
                $list += (i !== 0) ? ', ' : '';
                $list += $env.waiting[i];
            }
            if ($list === '') { $list = '[no players]'; }
            $client.say(target, replaceString($messages.waitingList, {'list': $list}));
        }
        
        if (data.$tgt === '-ready') {
            //$client.say(target, `BatJong : Hash generated - ${getHash()}`);
        }

        if (data.$tgt === '-playing') {
            //$client.say(target, `BatJong : Hash generated - ${getHash()}`);
        } 
        
        if (data.$tgt === null) {
            $client.say(target, $messages.targetIncorrect);
        }
    },
    'play': (target, data) => {
        // init game start and move to active tables
    },
    'lewds': (target, data) => {
        // post lewds lmao
    },
    'add': (target, data) => {
        // ADMIN ONLY - manually add a player to the waiting list
        if (data.$me && data.$tgt !== null) {
            const $player = toBoolean(findInObject($env.waiting, data.$tgt));
            let $data = { 'name': data.$tgt }
            if (!$player) {
                $env.waiting.push(data.$tgt);
                $data.total = $env.waiting.length;
                $client.say(target, replaceString($messages.adminAdd, $data));
            } else {
                $client.say(target, replaceString($messages.adminOnList, $data));
            }
        }

        if (data.$me && data.$tgt === null) {
            $client.say(target, $messages.adminAddName);
        } 

        if (!data.$me){
            $client.say(target, $messages.adminOnly);
        }
    },
    'remove': (target, data) => {
        // ADMIN ONLY - manually remove a player (or all) from the waiting list
        if (data.$me && data.$tgt !== null) {
            const $player = toBoolean(findInObject($env.waiting, data.$tgt));
            let $data = { 'name': data.$tgt }
            if ($player) {
                $env.waiting = removeFromArray($env.waiting, data.$tgt);
                $data.total = $env.waiting.length;
                $client.say(target, replaceString($messages.adminRemove, $data));
            } else {
                $client.say(target, replaceString($messages.adminNotOnList, $data));
            }
        }

        if (data.$me && data.$tgt === null) {
            $client.say(target, $messages.adminRemoveName);
        } 

        if (!data.$me){
            $client.say(target, $messages.adminOnly);
        }
    },
    'close': (target, data) => {
        // ADMIN ONLY - close a waiting table (or all tables)
        if (!data.$me){
            $client.say(target, $messages.adminOnly);
        }
    },
    'reset': (target, data) => {
        // ADMIN ONLY - reset both wait list and wait tables to init state
        if (data.$me){
            $env.waiting = [];
            $env.playing = [];
            $env.tables = {};
            $client.say(target, $messages.reset);
        }

        if (!data.$me){
            $client.say(target, $messages.adminOnly);
        }
    },
    'notify': (target, data) => {
        // ADMIN ONLY - send a notification to a waiting table
        if (!data.$me){
            $client.say(target, $messages.adminOnly);
        }
    },
    'start': (target, data) => {
        // ADMIN ONLY - restart command watching
        if (!data.$me){
            $client.say(target, $messages.adminOnly);
        }
    },
    'stop': (target, data) => {
        // ADMIN ONLY - stop command watching (excluding !batjong start)

        if (!data.$me){
            $client.say(target, $messages.adminOnly);
        }
    },
    'generate': (target, data) => {
        // ADMIN ONLY - generate waiting tables using the current active player list
        if (data.$me) {
            generateTables();
        }

        if (!data.$me){
            $client.say(target, $messages.adminOnly);
        }
    },
    'log': (target, data) => {
        // ADMIN ONLY - output all tracking lists to console
        if (data.$me){
            console.log('msg', [data.$cmd, data.$opt, data.$tgt]);
            console.log('env', $env);
            console.log('data', data);
        }

        if (!data.$me){
            $client.say(target, $messages.adminOnly);
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
    $data.$me = isMe($data.$name);

    // Ignore messages from the bot
    if (self) { return; }

    // if the command is called, check validity of option and execute function if valid
    if ($data.$cmd === process.env.BOT_COMMAND && $data.$opt !== null) {
        if (typeof fn[$data.$opt] !== 'undefined') {
            fn[$data.$opt](target, $data);
        } else {
            $client.say(target, $messages.commandIncorrect);
        }
    } else if ($data.$cmd === process.env.BOT_COMMAND && $data.$opt === null) {
        $client.say(target, `BatJong : I am the night.`);
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