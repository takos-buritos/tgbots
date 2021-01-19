const config = require('./config.json')

module.exports = {
    calc_total_count: (users) => {
        let total = 0
        users.forEach((u) => {
            total += u.count
        })  
        return total
    },
    find_user: (users, username) => {
        return users.find(u => u.username == username)
    },
    get_calling: () => {
        return getRandomItemFromArray(config.CALLINGS)
    },
    get_good_byes: () => {
        return getRandomItemFromArray(config.GOOD_BYES)
    },
    get_symbol_count: (text, sym) => {
        return text.split(sym).length - 1
    }    
};

getRandomItemFromArray = (arr) => {
    return arr[Math.floor(Math.random() * arr.length)]
}
