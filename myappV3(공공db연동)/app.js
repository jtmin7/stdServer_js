var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
var request = require('request');
var iconv = require('iconv-lite');


 var cheerio=require("cheerio")
 var qs = require('querystring');
/*var myurl= 'http://openapi.airkorea.or.kr/openapi/services/rest/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty?stationName=종로구&dataTerm=month&pageNo=1&numOfRows=10&ver=1.3&_returnType=json&ServiceKey=N526ONbZ%2Beb4ak1F%2FQZ8uVekkNoqNvUeSWFc3mxv%2FZG7DsG1%2F349mJx5UOU%2BgnIP5hx%2BA0puXsC8VfPY7NUbRw%3D%3D';*/



var mycharset = new Array();
for(var i=0; i<10; i++){
	mycharset[i] = "" + i;
}
mycharset[10] = 'A';
mycharset[11] = 'B';
mycharset[12] = 'C';
mycharset[13] = 'D';
mycharset[14] = 'E';
mycharset[15] = 'F';


function insertStr(str, index, value){
	return str.substring(0, index) + value + str.substring(index, str.length);
}
// str의 findstr 바로 뒤에 inputstr을 넣어준다
function inputPointStr(str, findstr, inputstr){
	return insertStr(str, str.indexOf(findstr) + findstr.length, inputstr);
}
// 참조: https://www.codingfactory.net/10429
// 참조: https://webisfree.com/2015-06-22/[%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8]-%EB%B0%B0%EC%97%B4-%EB%98%90%EB%8A%94-%EB%AC%B8%EC%9E%90%EC%97%B4%EC%97%90-indexof()-%EC%82%AC%EC%9A%A9%ED%95%9C-%ED%8A%B9%EC%A0%95-%EB%AC%B8%EC%9E%90-%EA%B2%80%EC%83%89


// 16진수 배열을 공공dbapi에서 원하는 utf-8 형식의 문자열로 바꿔주는 함수
function hexToString(hex){
	var a = parseInt(hex/16);
	var b = hex - a*16;
	a = mycharset[a];
	b = mycharset[b];
	return a + b;
}
function hexArrToString(hexrange){
	var str = "";
	for(var i=0; i<hexrange.length; i++){
		str += "%" + hexToString(hexrange[i]);
	}
	return str;
}


/*
#### 공공dbAPI 요청 url에 한글이 들어가는 경우
* 상세: 위의 요청 주소에 메소드를 명세서에서 보면 미세먼지 측정 구역이 필수 요청 요소로 URL에 반드시 들어가야 한다 그런데 주소는 한글이다 한글이 없는 요청 주소같은 경우는 잘 되며 한글이 있는 요청주소도 브라우저에서 입력하면 올바르게 받아올 수 있다 하지만, 한글이 들어간 URL로 request 모듈을 통해 요청하면 한글이 깨져서 전송되어 ERR_UNESCAPED_CHARACTERS 와 같은 에러를 낸다 
* 해결: var iconv = require('iconv-lite'); 라는 인코더 모듈을 설치하고 선언하여 쿼리의 한글 부분을 utf-8로 인코딩해 주었다 var jonglo = iconv.decode('종로구', 'iso-8859-5');
* 반성: 빠르게 해결해 보겠다고 저조한 컨디션 상태에서도 계속 붙들고 있었다 계속해서 시간은 가고 획기적인 발견이나 적극적인 시도들도 거의 없었다 도중에 동생에게서 전화가 왔고 통화를 안좋은 상황에서도 좋은 얘기를 했고 내 문제도 털어놨다 통화가 끝나고 냉정을 찾아 잠시 쉬었는데 쉬고 나서 잠시는 피로했지만 점점 활기찬 정신활동이 이루어지기 시작했고 적극적이고 다양한 시도들이 있었다
* 반성: 어려운 문제가 있을 때 절망이나 미련은 반드시 버려야 할 요소인 것 같다 


'191126.화
#### 공공db api 에 요청시 요청 목록들은 나타나는데 거기에 값이 들어있지 않은 경우
* 상세: 공공 dbapi에 요청시 한글 문자는 인코딩이 필요한대 위 예시는 출처에서 깨진 러시아어문자를 utf-8로 디코딩하는 방식을 그대로 썼다 때문에 url 이 맞는 형식이고 요청데이터 목록이 공공 db에서 해석될 수는 있었지만 목록이 db에 없는 이상한 데이터를 요청한 꼴이 되었다 때문에 서버에서도 답으로 빈 데이터를 보낸 것이다
* 해결: 서버에서 요청하는 한글 utf-8 형식은 다음과 같다 '%EC%A2%85%EB%A1%9C%EA%B5%AC' 1바이트 16진수 숫자들로 변환된 utf-8 hex 앞에 %가 붙는 방식이다 때문에 iconv.encode('종로구', 'utf-8'); 와 같이 한글을 utf-8로 인코딩 해주고 받은 16진수 배열을 이용해 위와같이 각 hex마다 %가 앞에 붙어 있는 문자열을 만들어서 url에 붙여주면 된다 다음과 같은 함수 hexArrToString를 만들어서 사용했다 개발자 사이트에 참조할 만 한 문의가 있었다(https://www.data.go.kr/information/QNA_0000000000015429/qna.do)

*/
var mainurl = 'http://openapi.airkorea.or.kr/openapi/services/rest/';

var operation_Measure = 'ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty'
var operation_Station = 'MsrstnInfoInqireSvc/getMsrstnList'
//getMinuDustFrcstDspth
//getUnityAirEnvrnIdexSnstiveAboveMsrstnList
//getMsrstnAcctoRltmMesureDnsty
mainurl = mainurl + operation_Measure;

var query = '?stationName=종로구&dataTerm=month&pageNo=1&numOfRows=10&ver=1.3&_returnType=json&_returnType=json&ServiceKey=';
//query = '?pageNo=1&numOfRows=20&addr=대전&_returnType=json&ServiceKey=';
//stationName=종로구&dataTerm=month&pageNo=1&numOfRows=10&ver=1.3&_returnType=json&

var jonglo = iconv.encode('종로구', 'utf-8'); // 한글 언어 -> utf-8
console.log(hexArrToString(jonglo));
query = query.replace("종로구", hexArrToString(jonglo));

console.log("종로: " + jonglo);
var daejeon = iconv.encode('대전', 'utf-8');
console.log("대전: " + hexArrToString(daejeon));
//query = query.replace('대전', hexArrToString(daejeon));
console.log("대전: " +daejeon);


var servicekey = 'N526ONbZ%2Beb4ak1F%2FQZ8uVekkNoqNvUeSWFc3mxv%2FZG7DsG1%2F349mJx5UOU%2BgnIP5hx%2BA0puXsC8VfPY7NUbRw%3D%3D';

var myurl = mainurl + query + servicekey;
console.log(myurl);

request({
            method:'GET',
            uri : myurl,
            mutipart:[{
                'content-type' :'text/html;charset=utf-8'
            }],
           
        }, function(err, res, body){
		if(err)
		console.log(err);

/*
'191126.화
#### json 데이터를 받아와 읽었는데 무한히 많은 항목이 떠버림
* 상세: 미세먼지 데이터와 관련해서 json 에 값들은 list, param.... 4개 밖에 되지 않는다 이중에서도 우리가 쓸 것은 list 뿐인데 받아온 데이터 크기를 보니 4000이 넘었다 이는 공공db에서 데이터를 줄 때 json 형식을 갖춘 문자열을 주기 때문이다 때문에 데이터 갯수가 터무니 없이 크게 나온 것이다 우선 json으로 parse를 해주어야 한다
* 해결: JSON.parse(body); 로 파서 해주어야 한다
*/
			var jsonObj = JSON.parse(body);
			//var jsonObj = body;
			//console.log(jsonObj);

			var str = "  -";

			if(false){
				var str = "  - ";
				var totalcount = jsonObj.list.length; 
				console.log("총 갯수: " + jsonObj.totalCount + "[" + jsonObj.list.length + "]");
				var listkey = Object.keys(jsonObj.list);
				for(var i=0; i<totalcount; i++){
					console.log(str + jsonObj.list[i].addr);
				}
			}


			// 받아온 json 데이타 길이를 얻는다
			//console.log("길이: " +jsonObj.list.length);

			// 미세먼지 측정 관련 출력
			if(true){
				/* 
				// json에 키목록 가져오기 
				// 출처: http://bamtol.net/v5/bbs/board.php?bo_table=pp_js&wr_id=36
				var a = Object.keys( body );
				console.log(a);
				a = Object.getOwnPropertyNames(body)
				console.log(a);
				for (var key in body) {
					console.log(key + ": " + body[key]); 
				} */
				// json 데이타에 키 리스트를 얻는 방법

				// 미세먼지 정보 list 에 키들을 넣을 배열
				var keylist = new Array();

				// list 에 모든 키들 얻어서 출력
				var a = Object.keys( jsonObj.list[0] );
					console.log(str + a);

				// list 에 모든 키중 미세먼지 관련 키들만 추출
				for(var i=0; i<a.length; i++){
					if(a[i].indexOf("pm") != -1){
						keylist.push(a[i]);
					}
				}
				//var b = jsonObj.list[0];
				//console.log("얻을 값: " + b[keylist[2]]);
			
				console.log(keylist);
				for(var i=0; i<jsonObj.list.length; i++){
					var b = jsonObj.list[i];
					console.log(b.dataTime);
					// 미세먼지 관련된 문자 배열 keylist를 통해서 list 내에 미세먼지 관련 데이터만 출력한다
					for(var j=0;j<keylist.length; j++){
						console.log(str + keylist[j] + ": " + b[keylist[j]] );
					}
				}
			}
				/*
      "pm10Value"
      "pm10Value24"
      "pm25Value"
      "pm25Value24"

      "pm10Grade"
      "pm10Grade1h":"1"
      "pm25Grade":"1",
      "pm25Grade1h":"1",,*/

            //console.log(body);
			console.log("json 방식 출력");
			console.log(myurl);
})



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
