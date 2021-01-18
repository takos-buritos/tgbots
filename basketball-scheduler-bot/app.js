const config = require('./config.json');

const { session, Telegraf } = require('telegraf')
const axios = require('axios')

const bot = new Telegraf(config.bot_token)

/*bot.use((ctx) => {
    ctx.reply("Hi, peedreela")
})*/

bot.start((ctx) => {
    ctx.reply("IM RUNNIN, BITCH!!1")
})

bot.help((ctx) => {
    ctx.reply("What I can do (except banging ur mama):\n - /start\n - /help")
})

bot.on('sticker', (ctx) => {
    ctx.reply("ur sticker sucks")
})

bot.hears('+', (ctx) => {
    ctx.reply("+ ACCEPTED")
})

bot.command('say', (ctx) => {
    msgArr = ctx.message.text.split(' ')
    msgArr.shift() //remove cmd
    msg = msgArr.join(' ') 
    ctx.reply(msg)
})

bot.command('fortune', (ctx) => {
    axios.get(config.rest.fortune).then((res) => {
        ctx.reply(res.data.fortune)
    })
})


bot.launch()
