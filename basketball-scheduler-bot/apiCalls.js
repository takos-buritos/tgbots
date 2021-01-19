const axios = require('axios')
const config = require('./config.json')
const nba_mock = require('./nba_mock.json')

module.exports = {
    getFortune: async () => {
        let res = await axios.get(config.REST.FORTUNE)
        return res.data.fortune    
    },
    getNBA: () => {
      return nba_mock
    }
};
