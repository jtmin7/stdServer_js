// JavaScript source code
/**
 * �����ͺ��̽� ��Ű���� �����ϴ� ���
 *
 * @date 2016-11-10
 * @author Mike
 */

var crypto = require('crypto');

var Schema = {};

Schema.createSchema = function(mongoose) {
	
	// ��Ű�� ����
	var UserSchema = mongoose.Schema({
	    id: {type: String, required: true, unique: true, 'default':''},
	    hashed_password: {type: String, required: true, 'default':''},
	    salt: {type:String, required:true},
	    name: {type: String, index: 'hashed', 'default':''},
	    age: {type: Number, 'default': -1},
	    created_at: {type: Date, index: {unique: false}, 'default': Date.now},
	    updated_at: {type: Date, index: {unique: false}, 'default': Date.now}
	});
	
	// password�� virtual �޼ҵ�� ���� : MongoDB�� ������� �ʴ� ���� �Ӽ���. Ư�� �Ӽ��� �����ϰ� set, get �޼ҵ带 ������
	UserSchema
	  .virtual('password')
	  .set(function(password) {
	    this._password = password;
	    this.salt = this.makeSalt();
	    this.hashed_password = this.encryptPassword(password);
	    console.log('virtual password ȣ��� : ' + this.hashed_password);
	  })
	  .get(function() { return this._password });
	
	// ��Ű���� �� �ν��Ͻ����� ����� �� �ִ� �޼ҵ� �߰�
	// ��й�ȣ ��ȣȭ �޼ҵ�
	UserSchema.method('encryptPassword', function(plainText, inSalt) {
		if (inSalt) {
			return crypto.createHmac('sha1', inSalt).update(plainText).digest('hex');
		} else {
			return crypto.createHmac('sha1', this.salt).update(plainText).digest('hex');
		}
	});
	
	// salt �� ����� �޼ҵ�
	UserSchema.method('makeSalt', function() {
		return Math.round((new Date().valueOf() * Math.random())) + '';
	});
	
	// ���� �޼ҵ� - �Էµ� ��й�ȣ�� �� (true/false ����)
	UserSchema.method('authenticate', function(plainText, inSalt, hashed_password) {
		if (inSalt) {
			console.log('authenticate ȣ��� : %s -> %s : %s', plainText, this.encryptPassword(plainText, inSalt), hashed_password);
			return this.encryptPassword(plainText, inSalt) === hashed_password;
		} else {
			console.log('authenticate ȣ��� : %s -> %s : %s', plainText, this.encryptPassword(plainText), this.hashed_password);
			return this.encryptPassword(plainText) === this.hashed_password;
		}
	});
	
	// ���� ��ȿ���� Ȯ���ϴ� �Լ� ����
	var validatePresenceOf = function(value) {
		return value && value.length;
	};
		
	// ���� ���� Ʈ���� �Լ� ���� (password �ʵ尡 ��ȿ���� ������ ���� �߻�)
	UserSchema.pre('save', function(next) {
		if (!this.isNew) return next();
	
		if (!validatePresenceOf(this.password)) {
			next(new Error('��ȿ���� ���� password �ʵ��Դϴ�.'));
		} else {
			next();
		}
	})
	
	// �ʼ� �Ӽ��� ���� ��ȿ�� Ȯ�� (���̰� üũ)
	UserSchema.path('id').validate(function (id) {
		return id.length;
	}, 'id Į���� ���� �����ϴ�.');
	
	UserSchema.path('name').validate(function (name) {
		return name.length;
	}, 'name Į���� ���� �����ϴ�.');
	
	UserSchema.path('hashed_password').validate(function (hashed_password) {
		return hashed_password.length;
	}, 'hashed_password Į���� ���� �����ϴ�.');
	
	   
	// ��Ű���� static �޼ҵ� �߰�
	UserSchema.static('findById', function(id, callback) {
		return this.find({id:id}, callback);
	});
	
	UserSchema.static('findAll', function(callback) {
		return this.find({}, callback);
	});
	
	console.log('UserSchema ������.');

	return UserSchema;
};

// module.exports�� UserSchema ��ü ���� �Ҵ�
module.exports = Schema;

