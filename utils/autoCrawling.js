const cronJob = require('cron').CronJob;
const TEST = require('./test')
const Crawling = require('./Crawling')

new cronJob('0 0 */24 * * *', () => {
    // 여기서 원하는 사용자 정의 함수
    console.log("Auto Crawling Start!@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
    Crawling()
}).start();