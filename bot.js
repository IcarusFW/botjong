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

// set up environment object
let $env = {
    'waiting': [],
    'playing': [],
    'tables': {}
}

const $pervert = [
    'https://www.reddit.com/r/rule34/',
    'https://exhentai.org',
    'https://e-hentai.org',
    'https://www.pixiv.net/tags/R-18'
]

const fn = {
    'join': function(target, data){
        // sign into waiting list to play
        const $player = toBoolean(findInObject($env.waiting, data.$name));
        if (!$player) {
            $env.waiting.push(data.$name);
            $client.say(target, `@${data.$name} has joined the match waiting list.`);
        } else {
            $client.say(target, `@${data.$name}, you're already on the waiting list.`);
        }
    },
    'leave': function(target, data){
        // sign out of waiting list
        const $player = toBoolean(findInObject($env.waiting, data.$name));
        if ($player) {
            $env.waiting = removeFromArray($env.waiting, data.$name);
            $client.say(target, `@${data.$name} left the match waiting list.`);
        } else {
            $client.say(target, `@${data.$name}, you're not on the waiting list.`);
        }
    },
    'waiting': function(target, data){
        // check waiting lists
        if (data.$tgt === '-total') {
            $client.say(target, `BatJong : There are currently ${$env.waiting.length} players awaiting a match.`);
        }
        
        if (data.$tgt === '-list') {
            let $temp = '';
            for (var i = 0; i < $env.waiting.length; i++) {
                $temp += (i !== 0) ? ', ' : '';
                $temp += $env.waiting[i];
            }
            $client.say(target, `BatJong : Players awaiting a match - ${$temp}`);
        }
        
        if (data.$tgt === '-tables') {
            //$client.say(target, `BatJong : Hash generated - ${getHash()}`);
        } 
        
        if (data.$tgt === null) {
            $client.say(target, `BatJong : I don't recognise that option...`);
        }
    },
    'play': function(target, data){
        // init game start and move to active tables
    },
    'add': function(target, data){
        // ADMIN ONLY - manually add a player to the waiting list
        if (data.$me && data.$tgt !== null) {
            const $player = toBoolean(findInObject($env.waiting, data.$tgt));
            if (!$player) {
                $env.waiting.push(data.$tgt);
                $client.say(target, `@${data.$tgt} has been added to the match waiting list.`);
            } else {
                $client.say(target, `@${data.$tgt} is already on the waiting list.`);
            }
        }

        if (data.$me && data.$tgt === null) {
            $client.say(target, `BatJong : You need to provide a player name to add to the list.`);
        } 

        if (!data.$me){
            $client.say(target, `BatJong : That's an admin-only command.`);
        }
    },
    'remove': function(target, data){
        // ADMIN ONLY - manually remove a player (or all) from the waiting list
        if (data.$me && data.$tgt !== null) {
            const $player = toBoolean(findInObject($env.waiting, data.$tgt));
            if ($player) {
                $env.waiting = removeFromArray($env.waiting, data.$tgt);
                $client.say(target, `@${data.$tgt} has been removed from the match waiting list.`);
            } else {
                $client.say(target, `@${data.$tgt} is not on the waiting list.`);
            }
        }

        if (data.$me && data.$tgt === null) {
            $client.say(target, `BatJong : You need to provide a player name to remove from the list.`);
        } 

        if (!data.$me){
            $client.say(target, `BatJong : That's an admin-only command.`);
        }
    },
    'close': function(target, data){
        // ADMIN ONLY - close a waiting table (or all tables)
    },
    'reset': function(target, data){
        // ADMIN ONLY - reset both wait list and wait tables to init state
    },
    'notify': function(target, data){
        // ADMIN ONLY - send a notification to a waiting table
    },
    'start': function(target, data){
        // ADMIN ONLY - restart command watching
    },
    'stop': function(target, data){
        // ADMIN ONLY - stop command watching (excluding !batjong start)
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

    // if the command is !batjong, execute bot functions
    if ($data.$cmd === '!batjong' && $data.$opt !== null) { 
        fn[$data.$opt](target, $data);
    } else if ($data.$cmd === '!batjong' && $data.$opt === null) {
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