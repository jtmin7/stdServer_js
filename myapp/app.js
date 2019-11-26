var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');

var bodyParser = require('body-parser');
var app = express();

// mongoose 모듈 사용
var mongoose = require('mongoose');

// 모듈로 분리한 설정 파일 불러오기
var config = require('./config');

// 모듈로 분리한 데이터베이스 파일 불러오기
//var database = require('./database/database');
var database = require('./bin/www');

// 모듈로 분리한 라우팅 파일 불러오기
var route_loader = require('./routes/route_loader');

// 라우터 객체 참조
var router = express.Router();


route_loader.init(app, router);
/**
@author	jtmin
@brief	server program
@date	'19.11.13.
@file	app.js
*/

// view engine setup
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// **
// static 미들웨어는 public 폴더 안에 있는 것들을 주소입력을 통해서 클라이언트가 접속할 수 있게 해준다
// public 주소와 메핑시켜서 반드시 /public 과 함께 입력해야 폴더의 리소스에 접근할 수 있게 한다
// ex http://localhost:3000/public/images/다운로드.jpg
// 메핑할 주소는 영어만 된다. 한글로 하면 반응이 없다
// 이렇게 메핑한 주소는 html 문서로 쓴것들도 같이 적용 받는다. 즉 메핑된 주소가 아닌 그냥 public 의 디렉토리로 접근하면 반응이 없다
// ex res.end("<img src='/fuck/images/다운로드.jpg' width = '10%'>");

app.use('/fuck', express.static(path.join(__dirname, 'public')));

//**
// body parser 미들웨어는 html 페이지에서 input 테그에 submit 속성을 가진 녀석이 클릭되었을 때 
// post로 전송되는 메시지들을 받아서 req.param에 넣어준다 서버에서는 이를 빼서 처리하면 된다
// html에서 form에 type 가 post 인 것의 안에 있는 것들이 전송된다. name 속성값과 value 속성값이 전송된다

app.use(bodyParser.urlencoded({extended: true}));


//app.use('/', indexRouter);
//app.use('/users', usersRouter);


app.use(function(req, res, next){
	console.log("첫 요청 처리");

//	res.redirect('https://www.youtube.com/watch?v=RQQcOvBv4Ls');
	var userAgent = req.header('User-Agent');
	//var paramName = req.param('name');
	
	// send 할 경우 다음으로 넘어가지 않고 그냥 여기서 끝난다
	// 라우터로 가지도 않는다
	//res.send('asdfkljdfkl');
	//res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
	

	//res.write('<div><p> 미들웨어!!! </p></div>');
	//res.end("<img src='/fuck/images/다운로드2.jpg' width = '40%'>");


	//res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
	//res.write('<h1> express 서버에서 응답한 결과</h1>');
	//res.write('<div><p>user-agent: ' + useragent + '</p></div>');
	//res.write('<div><p>param-name: ' + paramName + '</p></div>');
	
	req.user = 'mike';
	next();
});
app.use(function(req, res, next){
	//var paramId = req.param('id');
	//var paramPassword = req.param('password');
	
//	res.write('<div><p>Paramid: '+paramId + '</p></div>');
//	res.write('<div><p>Parampassword: '+paramPassword + '</p></div>');
//	
//
	//res.end("<img src='/fuck/images/다운로드.jpg' width = '10%'>");
	next();
});

app.use('/', function(req, res, next){
	console.log("두 번째 미들웨어");
//	res.send({name: '소녀', age: 20});
	
	
//	res.write('<h1>Express서버응답 </h1>');

//	res.send('<strong> dfslk </strong>')
	
//	res.end('<h3> 이 건 두번째 미들웨어에서</h3>');
	next();
});

// ** 
// \public\html\login.html 문서의 한글이 깨져서 나오는 오류
// 참조: https://m.blog.naver.com/PostView.nhn?blogId=chsmanager&logNo=140204259964&proxyReferer=https%3A%2F%2Fwww.google.com%2F
// 메모장에서 html 문서 저장시 인코딩 방식을 지정하는 부분이 있다 

// **
// post 에서 일단 첫 인수는 반드시 public 폴더 안에 있는 파일의 주소이어야 하는 것 같다. 대신 파일 확장자는 붙지 않는다
// html 에서 action 속성에도 마찬가지 규칙으로 주소를 적는다 서로 다른 주소이거나 잘못된 주소가 입력된 경우 404 애러를 낸다
// 주소가 아닌것 같다. 일단 html 폴더에 있는 파일이라면 첫 번째 것은 /html로 들어가야 하가 다음 주소는 아무거나 정할 수 있는 것 같다
// 정확한 규칙은 모르겠다
/*
app.post('/html/login', function(req,res){
	console.log('/process/login 처리함');
	var paramId = req.param('id');
	var paramPassword = req.param('password');

	if(database){
		authUser(database, paramId, paramPassword, function(err, docs){
			if(err) {throw err;}
			if(docs){
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				
				res.write('<div><p> 라우팅, 로그인 성공 paramid: ' + paramId + '</p></div>');
				res.write('<div><p> 사용자 아이디: ' + paramId + '</p></div>');
				res.write('<div><p> 사용자 비밀번호: ' + paramPassword + '</p></div>');
				res.write("<br><br><a href='/fuck/html/login.html'>다시 로그인하기 </a>");
				
				res.end("<img src='/fuck/images/다운로드.jpg' width = '20%'>");
			}
			else{
				res.writeHead('200', {'Content-Type' : 'text/html;charset=utf8'});
				res.write('<h2>로그인 실패</h2>');
				res.write("<br><br><a href='/fuck/html/login.html'>다시 로그인하기 </a>");
				res.end();
			}
		})
	}
	else{
		res.writeHead('200', {'Content-Type' : 'text/html;charset=utf8'});
		res.write('<h2> 데이터베이스 연결 실패 </h2>')		
	}
});
app.post('/html/show', function(req, res){
	console.log('/process/show 처리 시작');
	if(database){
		var users = database.collection('users');
		users.findAll(function(err, results){
			if(err){
				callback(err, null);
				return;
			}
			if(results){
				console.dir(results);
				res.writeHead('200', {'Content-Type' : 'application/json; charset = utf8'});
				res.write(JSON.stringify(results));
				res.end();
			}
		});
	}
});
app.post('/html/poss', function(req,res){
	console.log('/process/login 처리함');
	var paramId = req.param('id');
	var paramPassword = req.param('password');
	var paramName = req.param('name');
	
	if(database){
		addUser(database, paramId, paramPassword, paramName, function(err, result){
			if(err) {throw err;}
			if(result){
				console.dir(result);

					res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
	 
					res.write('<div><p> 사용자 추가 성공 paramid: ' + paramId+ '</p></div>');
					
					res.write("<br><br><a href='/fuck/html/login.html'>다시 로그인하기 </a>");
				
					res.end("<img src='/fuck/images/다운로드2.jpg' width = '40%'>");

			}
		});
	}
	else{
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>데이터베이스 연결 실패<h2>');
		res.end();
	}
});


//사용자 리스트 함수
app.post('/html/listuser', function(req, res) {
	console.log('/html/listuser 호출됨.');

    // 데이터베이스 객체가 초기화된 경우, 모델 객체의 findAll 메소드 호출
	if (database) {
		// 1. 모든 사용자 검색
		UserModel.findAll(function(err, results) {
			// 에러 발생 시, 클라이언트로 에러 전송
			if (err) {
                console.error('사용자 리스트 조회 중 에러 발생 : ' + err.stack);
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>사용자 리스트 조회 중 에러 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
				res.end();
                
                return;
            }
			  
			if (results) {  // 결과 객체 있으면 리스트 전송
				console.dir(results);
 
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>사용자 리스트</h2>');
				res.write('<div><ul>');
				
				for (var i = 0; i < results.length; i++) {
					var curId = results[i]._doc.id;
					var curName = results[i]._doc.name;
					res.write('    <li>#' + i + ' : ' + curId + ', ' + curName + '</li>');
				}	
			
				res.write('</ul></div>');
				res.end();
			} else {  // 결과 객체가 없으면 실패 응답 전송
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>사용자 리스트 조회  실패</h2>');
				res.end();
			}
		});
	} else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>데이터베이스 연결 실패</h2>');
		res.end();
	}
	
});
/*
// **1
// db 연결하고 응답 객체의 속성으로 db객체 추가
function connectDB(){
	// db 연결정보
	// 문자열 형식: mongodb://%IP정보%:%포트정보%/%데이터베이스이름%
	var databaseUrl = 'mongodb://localhost:27017/shopping';

	// db 연결
	mongodb.connect(databaseUrl, function(err, db){
		if(err) throw err;

		console.log('데이터베이스에 연결되었습니다.: ' + databaseUrl);
		// **2 이렇게 할당 시에 변수명을 명시(db('local') 해주어야 애러 안뜸
		// database 변수에 할당
		database = db.db('local');
	});
}
*/

//===== 데이터베이스 연결 =====//

// 데이터베이스 객체를 위한 변수 선언
//var database;

// 데이터베이스 스키마 객체를 위한 변수 선언
//var UserSchema;

// 데이터베이스 모델 객체를 위한 변수 선언
//var UserModel;
/*
//데이터베이스에 연결
function connectDB() {
	// 데이터베이스 연결 정보
	var databaseUrl = 'mongodb://localhost:27017/local';
	 
	// 데이터베이스 연결
    console.log('데이터베이스 연결을 시도합니다.');
    mongoose.Promise = global.Promise;  // mongoose의 Promise 객체는 global의 Promise 객체 사용하도록 함
	mongoose.connect(databaseUrl);
	database = mongoose.connection;
	
	database.on('error', console.error.bind(console, 'mongoose connection error.'));	
	database.on('open', function () {
		console.log('데이터베이스에 연결되었습니다. : ' + databaseUrl);
		
		
		// 스키마 정의
		UserSchema = mongoose.Schema({
		    id: {type: String, required: true, unique: true},
		    password: {type: String, required: true},
		    name: {type: String, index: 'hashed'},
		    age: {type: Number, 'default': -1},
		    created_at: {type: Date, index: {unique: false}, 'default': Date.now},
		    updated_at: {type: Date, index: {unique: false}, 'default': Date.now}
		});
		
		// 스키마에 static으로 findById 메소드 추가
		UserSchema.static('findById', function(id, callback) {
			return this.find({id:id}, callback);
		});
		
        // 스키마에 static으로 findAll 메소드 추가
		UserSchema.static('findAll', function(callback) {
			return this.find({}, callback);
		});
		
		// UserModel 모델 정의
		UserModel = mongoose.model("users", UserSchema);
		console.log('UserModel 정의함.');
		
	});
    
    // 연결 끊어졌을 때 5초 후 재연결
	database.on('disconnected', function() {
        console.log('연결이 끊어졌습니다. 5초 후 재연결합니다.');
        setInterval(connectDB, 5000);
    });
}
*/


/*
function authUser(database, id, password, callback){
	console.log('authUser 호출됨');
	// users 컬렉션 참조
	// **2
	// 애러뜸: database.collection is not a function
	// 참조: https://preamtree.tistory.com/109
	var users = database.collection('users');
	// id, pw 검색
	users.find({"id" : id, "password" : password}).toArray(function(err, docs){
		if(err){
			callback(err, null);
			return;
		}
		if(docs.length > 0){
			console.log("아이디 [%s] 비밀번호 [%s] 가 일치하는 사용자 찾음", id, password);
			callback(null, docs);
		}
		else{
			console.log("일치하는 사용자 못 찾음");
			callback(null, null);
		}
	});
}
*/

/*
// 사용자를 인증하는 함수 : 아이디로 먼저 찾고 비밀번호를 그 다음에 비교하도록 함
var authUser = function(database, id, password, callback) {
	console.log('authUser 호출됨 : ' + id + ', ' + password);
	
    // 1. 아이디를 이용해 검색
	database.UserModel.findById(id, function(err, results) {
		if (err) {
			callback(err, null);
			return;
		}
		
		console.log('아이디 [%s]로 사용자 검색결과', id);
		console.dir(results);
		
		if (results.length > 0) {
			console.log('아이디와 일치하는 사용자 찾음.');
			
			// 2. 패스워드 확인
			if (results[0]._doc.password === password) {
				console.log('비밀번호 일치함');
				callback(null, results);
			} else {
				console.log('비밀번호 일치하지 않음');
				callback(null, null);
			}
			
		} else {
	    	console.log("아이디와 일치하는 사용자를 찾지 못함.");
	    	callback(null, null);
	    }
		
	});
	
}



/*
// **
// 사용자 등록 함수
var addUser = function(database, id, password, name, callback){
	console.log("addUser 호출됨");
	var users = database.collection('users');
	users.insert([{"id" : id, "password": password, "name" : name}], function(err, result){
		if(err){
			callback(err, nul);
			return ;
		}
		console.log("사용자 데이터 추가 완료");
		callback(null, result);
	});
}


//사용자를 추가하는 함수
var addUser = function(database, id, password, name, callback) {
	console.log('addUser 호출됨 : ' + id + ', ' + password + ', ' + name);
	
	// UserModel 인스턴스 생성
	var user = new UserModel({"id":id, "password":password, "name":name});

	// save()로 저장 : 저장 성공 시 addedUser 객체가 파라미터로 전달됨
	user.save(function(err, addedUser) {
		if (err) {
			callback(err, null);
			return;
		}
		
	    console.log("사용자 데이터 추가함.");
	    callback(null, addedUser);
	     
	});
};
*/


//app.set('connectDB', connectDB());



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
  next();
});



//===== 서버 시작 =====//

// 프로세스 종료 시에 데이터베이스 연결 해제
process.on('SIGTERM', function () {
    console.log("프로세스가 종료됩니다.");
    app.close();
});

app.on('close', function () {
	console.log("Express 서버 객체가 종료됩니다.");
	if (database.db) {
		database.db.close();
	}
});



module.exports = app;
