const mysql = require('mysql');
const axios = require("axios");
const cheerio = require("cheerio");
const connection = mysql.createConnection({
    host: '104.155.144.166',
    user: 'root',
    password: '123123',
    database: 'withus',
    charset: 'utf8mb4'
});
// 년월 DATETIME으로 바꾸기
function changeDate(data) {
    //년월일 제거
    data = data.replace(/년|월/g, "-");
    data = data.replace(/일/g, " ").split(" ")
    //오후,오전 바꾸기
    time = ''
    if (data[1] != '') {//뒤에 시간이 있는 경우
        time = data[1].split(":")
        if (time[1].slice(-2) == '오후' && parseInt(time[0]) < 12) {//hour에 11->23으로 +12를 해준다.
            time[0] = String(parseInt(time[0]) + 12)
        }
        time[1] = time[1].slice(0, 2)
        time = time.join(":")
    }
    date = data[0] + (data[1] == '' ? '' : " " + time)
    return date
}


var Crawling = function(){
    //crawling시작
    var total = 0;
    var list = [];
    function crawling() {
        var flag = 0 // 비동기 axios가 다 돌았을 경우를 잡아내기 위함
        var page = 16 // 페이지의 수를 설정한다.
        var CompeteBoardList = new Array();
        return new Promise(function (resolve, reject) {
            for (var i = 1; i <= page; i++) {
                axios.get("https://allforyoung.com/posts/category/2/?page=" + i).then(html => {
                    const $ = cheerio.load(html.data); //html데이터 가져옴
                    var count = 0
                    $('#post_list > div > div.posts_area > div > div.post_card_poster > a').each((index, item) => {
                        //console.log(count, item.attribs.href)
                        count += 1
                        list.push(item.attribs.href)//각 주소를 list에 저장한다.
                    });
                    flag += 1
                    return flag
                }).then(flag => {
                    //console.log("flag", flag);
                    //console.log("page", page);
                    if (flag == page) { // 모든 비동기 axios가 돌았을때 차례로 데이터를 파싱한다.
                        for (let index = 0; index < list.length; index++) {
                            axios.get("https://allforyoung.com/" + list[index]).then(html => {
                                var CompeteBoard = {};
                                const $ = cheerio.load(html.data); //html데이터 가져옴
                                //console.log("\n", list[index], "\n");
                                //console.log("제목 : ", $('body > section > div > div > div.post_title > h1').text());
                                CompeteBoard.CB_title = $('body > section > div > div > div.post_title > h1').text();

                                //console.log("이미지 : ", $('body > section > div > div > div.detail_poster > div > a > picture > img').attr('src'));
                                CompeteBoard.CB_photo = $('body > section > div > div > div.detail_poster > div > a > picture > img').attr('src');

                                $('body > section > div > div > div.detail_info > table > tbody > tr > td')
                                    .each((index, item) => {
                                        if (item.children.length == 0)//값이 비어있는 경우
                                            console.log(index, "empty")
                                        else if (index == 0)
                                            //console.log("주최사 : ", item.children[0].data.replace(/\n| /g, ""));
                                            CompeteBoard.CB_organization = item.children[0].data.replace(/\n| /g, "");

                                        else if (index == 1) {
                                            //console.log("시작날짜 : ", item.children[0].data.replace(/\n| /g, "").split('~')[0]);
                                            CompeteBoard.CB_startDate = item.children[0].data.replace(/\n| /g, "").split('~')[0];
                                            CompeteBoard.CB_startDate = changeDate(CompeteBoard.CB_startDate)

                                            //console.log("마감날짜 : ", item.children[0].data.replace(/\n| /g, "").split('~')[1]);
                                            CompeteBoard.CB_finalDate = item.children[0].data.replace(/\n| /g, "").split('~')[1];
                                            CompeteBoard.CB_finalDate = changeDate(CompeteBoard.CB_finalDate)

                                        }
                                        else if (index == 2)
                                            //console.log("분야 : ", item.children[0].data.replace(/\n| /g, ""));
                                            CompeteBoard.CB_field = item.children[0].data.replace(/\n| /g, "");

                                        else if (index == 3)
                                            //console.log("대상 : ", item.children[0].data.replace(/\n| /g, ""));
                                            CompeteBoard.CB_target = item.children[0].data.replace(/\n| /g, "");

                                        // else if(index == 4)
                                        //     console.log("상금규모 : ", item.children[0].data.replace(/\n| /g, ""));
                                        // else
                                        //     console.log("그밖의정보 : ", item.children[0].data.replace(/\n| /g, ""))      
                                    });

                                if ($('body > section > div > div > div.detail_info > div > button.info_button_apply').attr('onclick'))
                                    //console.log("링크 : ", $('body > section > div > div > div.detail_info > div > button.info_button_apply').attr('onclick').split('\'')[1]);
                                    CompeteBoard.CB_link = $('body > section > div > div > div.detail_info > div > button.info_button_apply').attr('onclick').split('\'')[1];


                                //console.log("본문 : " , $('body div.mom section.detail_section div div p').find('span').text());
                                CompeteBoard.CB_content = $('#description > div > div').html();
                                CompeteBoardList.push(CompeteBoard);

                                return CompeteBoardList;
                            }).then(CompeteBoardList => {
                                if (CompeteBoardList.length == list.length) {
                                    resolve(CompeteBoardList)
                                }
                            }).catch(function (error) {
                                console.log(list[index]);
                                console.log(error)
                            })
                        }
                    }
                });
            }
        });
    }
    crawling().then(function (CompeteBoardList) {
        //console.log("----------------------페이지-------------------");
        //console.log("객체 : ", CompeteBoardList);

        //console.log(CompeteBoardList)
        for (var j = 0; j < CompeteBoardList.length; j++) {
            var params = [CompeteBoardList[j].CB_title, CompeteBoardList[j].CB_photo, CompeteBoardList[j].CB_organization, CompeteBoardList[j].CB_startDate, CompeteBoardList[j].CB_finalDate, CompeteBoardList[j].CB_field, CompeteBoardList[j].CB_target, CompeteBoardList[j].CB_link, CompeteBoardList[j].CB_content];
            params = params.concat([CompeteBoardList[j].CB_photo, CompeteBoardList[j].CB_organization, CompeteBoardList[j].CB_startDate, CompeteBoardList[j].CB_finalDate, CompeteBoardList[j].CB_field, CompeteBoardList[j].CB_target, CompeteBoardList[j].CB_link, CompeteBoardList[j].CB_content])
            connection.query('Insert into CompeteBoard (CB_title, CB_photo, CB_organization, CB_startDate, CB_finalDate, CB_field, CB_target, CB_link, CB_content, CB_count) ' +
                'values (?,?,?,?,?,?,?,?,?,0) ON DUPLICATE KEY UPDATE ' +
                ' CB_photo=?, CB_organization=?, CB_startDate=?, CB_finalDate=?, CB_field=?, CB_target=?, CB_link=?, CB_content=? ,CB_count=CB_count+1;',
                params, (error, rows, fields) => {
                    if (error) console.log(error);
                    //console.log(rows);
                }
            );

            /*connection.query('Insert into CompeteBoard (CB_title, CB_photo, CB_organization, CB_startDate, CB_finalDate, CB_field, CB_target, CB_link, CB_content, CB_count) '+
            `values ('${CompeteBoardList[j].CB_title}','${CompeteBoardList[j].CB_photo}','${CompeteBoardList[j].CB_organization}','${CompeteBoardList[j].CB_startDate}','${CompeteBoardList[j].CB_finalDate}','${CompeteBoardList[j].CB_field}','${CompeteBoardList[j].CB_target}','${CompeteBoardList[j].CB_link}','${CompeteBoardList[j].CB_content}',0) `+
            `ON DUPLICATE KEY UPDATE CB_photo='${CompeteBoardList[j].CB_photo}',`+
            `CB_organization='${CompeteBoardList[j].CB_organization}',`+
            `CB_startDate='${CompeteBoardList[j].CB_startDate}',`+
            `CB_finalDate='${CompeteBoardList[j].CB_finalDate}',`+ 
            `CB_field='${CompeteBoardList[j].CB_field}', CB_target='${CompeteBoardList[j].CB_target}', `+
            `CB_link='${CompeteBoardList[j].CB_link}', CB_content='${CompeteBoardList[j].CB_content}' ;`,
            (error, rows, fields) => {
                if (error) console.log(error);
                //console.log(rows);
            }
            );*/
        }
        connection.end();
    });
}
module.exports = Crawling