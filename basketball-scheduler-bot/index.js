//floating-gorge-67145
//https://floating-gorge-67145.herokuapp.com/

require('dotenv').config()

const { getFortune } = require('./apiCalls.js')
const { calc_total_count, find_user, get_calling, get_good_byes, get_symbol_count } = require('./extFunc.js')
const config = require('./config.json')

//const { session, Telegraf } = require('telegraf')
const { Composer } = require('micro-bot')
//const bot = new Telegraf(process.env.TG_TOKEN)
const bot = new Composer()

const CronJob = require('cron').CronJob
var _cronJob = null

/**GLOBAL OBJECTS TO STORE WORKOUT PARTICIPANTS */
var participants = []
var queue = []

/*bot.use(session({
    makeKey: (ctx) => ctx.chat?.id // only store data per chat
}))*/

/* INIT & WORK WITH SCHEDULER */
const createJob = async (chatid) => {
    return new CronJob('*/1 * * * *', async () => {
        await bot.telegram.sendMessage(chatid, "test");
        console.log('Job running');
    });
}

bot.command('wake_up_neo', async (ctx) => {
    reinitGlobalCollections()
    if (!_cronJob) _cronJob = await createJob(ctx.chat.id)
    _cronJob.start()
    ctx.reply(`ПОГНАЛИ НАХУЙ!!1`);
    
})

bot.command('fuck_off_neo', (ctx) => {    
    _cronJob.stop()
    ctx.reply('АРИВИДЕРЧИ, ГОМОСЕКИ')
})

/* MAIN LOGIC */

//add users by sending +
bot.hears(/^\++/, (ctx) => {    
    let curCount = get_symbol_count(ctx.message.text, '+')     
    let params = { isInQueue: false, isInGame: false }   // dictionary to pass these bool values by reference

    // increase all counts by 1 because user can have several +, some of them are in game, other in queue
    for(i = 1; i <= curCount; i++){
        addParticipant(ctx, params)
    }
    
    let msg = ''
    if (params.isInGame){
        msg = `Ты в игре ${get_calling()}!`
    }
    if (params.isInQueue){
        msg = `В очередь ${get_calling()}!`
    }
    if (params.isInGame && params.isInQueue){
        msg = 'Частично принят, частично нет - разберись там как-нибудь сам'
    }

    ctx.telegram.sendMessage(
        ctx.chat.id, 
        `${msg}\n${getTotalMsgHtml()}`, 
        { 
            parse_mode: 'HTML', 
            reply_to_message_id: ctx.message.message_id 
        }
    )
})

addParticipant = (ctx, params, externalUser) => {
    let tgUser = externalUser == undefined ? ctx.message.from : externalUser
    let username = tgUser.username  
    let userObj

    if (calc_total_count(participants) < config.MAX_PARTICIPANTS) {
        userObj = find_user(participants, username)
        params.isInGame = true
    } else {
        userObj = find_user(queue, username)
        params.isInQueue = true
    }

    if(userObj) {
        userObj.count += 1
    } else {
        if (params.isInQueue) {
            queue.push({username: username, user: tgUser, count: 1 })
        } else {
            participants.push({username: username, user: tgUser, count: 1 })
        }
    }
}

//remove users by sending -
bot.hears(/^-+/, (ctx) => {    
    let curCount = get_symbol_count(ctx.message.text, '-') 
    let params = { partlyFromQueue: false}

    // decrease all counts by 1 because user can have several +, some of them are in game, other in queue
    for(i = 1; i <= curCount; i++){
        // first search in queue
        removeParticipant(ctx, params)        
    }

    ctx.telegram.sendMessage(
        ctx.chat.id, 
        `${get_good_byes()} ${get_calling()}\n${getTotalMsgHtml()}`, 
        { 
            parse_mode: 'HTML', 
            reply_to_message_id: ctx.message.message_id 
        }
    )
})
removeParticipant = (ctx) => {
    let username = ctx.message.from.username
    let userObj

    userObj = find_user(queue, username)
    if (userObj) {
        removeFromGlobalQueue(userObj)
    } else { // if user in participants - remove him and add one from queue
        userObj = find_user(participants, username)
        removeFromGlobalParticipants(userObj)
        //add first from query to participants
        if (queue.length > 0){
            let tgUser = queue[0].user
            removeFromGlobalQueue(queue[0])
            addParticipant(ctx, { isInQueue: false, isInGame: false }, tgUser)
            ctx.telegram.sendMessage(ctx.chat.id, `@${tgUser.username} твой плюс теперь в игре ${get_calling()}`)
        }        
    }
}

removeFromGlobalQueue = (userObj) => {
    if (userObj.count > 1){
        userObj.count--
    } else {
        queue = queue.filter(i => i.username !== userObj.username)
    }
}
removeFromGlobalParticipants = (userObj) => {
    if (userObj.count > 1){
        userObj.count--
    } else {
        participants = participants.filter(i => i.username !== userObj.username)
    }
}

bot.command('clear_pidrilas', (ctx) => {    
    reinitGlobalCollections()
    ctx.reply('PIDRILAS ARE CLEARED')
})

bot.command('show_pidrilas', (ctx) => {    
    let str = ''

    if (participants.length > 0){
        str += `<b>В игре</b>:\n`
    }
    participants.forEach((p) => {
        str += createUserString(p)
    });

    if (queue.length > 0){
        str += `<b>В очереди</b>:\n`
    }
    queue.forEach((q) => {
        str += createUserString(q)
    });
    str += getTotalMsgHtml()
    
    ctx.telegram.sendMessage(ctx.chat.id, str, { parse_mode: 'HTML' })
})

createUserString = (u) => {
    return `${u.user.last_name ? `${u.user.last_name} ` : ''}${u.user.first_name} (@${u.username}) в количестве ${u.count} шт.\n`
}

getTotalMsgHtml = () => {
    if (participants.length > 0 && queue.length > 0)
        return `<b>Итого: <i>${calc_total_count(participants)}</i>, в очереди: <i>${calc_total_count(queue)}</i></b>`
    if (participants.length > 0 )
        return `<b>Итого: <i>${calc_total_count(participants)}</i></b>`
    if (participants.length > 0 && queue.length > 0)
        return `<b>В очереди: <i>${calc_total_count(queue)}</i></b>`
    return `<b>Никого нет, все стали натуралами :(</b>`
}

reinitGlobalCollections = () => {
    participants = []
    queue = []
}

/* ENTERTAINMENT */

bot.on('sticker', (ctx) => {
    ctx.telegram.sendMessage(ctx.chat.id, 'ur sticker sucks', { reply_to_message_id: ctx.message.message_id })
})

/* TEST STUFF */

bot.command('fortune', async (ctx) => {
    let f = await getFortune()
    ctx.reply(f)
    /*axios.get(config.rest.fortune).then((res) => {
        ctx.reply(res.data.fortune)
    })*/
})

bot.command('menu_test', (ctx) => {
    ctx.telegram.sendMessage(ctx.chat.id, 'pook pook', 
    { 
        reply_markup: {
            inline_keyboard: [ 
                [{ text: 'vk', url:'www.vk.com' }, { text: 'vk 2', url:'www.vk.com' }],
                [{ text: 'youtube', url:'www.youtume.com' }]
            ]
        }
    })
})


//bot.launch()
module.exports = bot
