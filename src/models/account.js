const { generateToken } = require("lib/token");

const mongoose = require("mongoose");
const { Schema } = mongoose;
const crypto = require("crypto");

// 비밀번호 HMAC SHA256으로 해싱
function hash(password) {
  return crypto
    .createHmac("sha256", process.env.SECRET_KEY)
    .update(password)
    .digest("hex");
}

const Account = new Schema({
  profile: {
    username: String,
    thumbnail: {
      type: String,
      default: "/static/images/default_thumbnail.png",
    },
  },
  email: { type: String },
  //  소셜 계정 사용할 경우 각 서비스에서 제공되는 id , accessToken 저장
  social: {
    facebook: {
      id: String,
      accessToken: String,
    },
    google: {
      id: String,
      accessToken: String,
    },
  },
  // 로컬 비밀번호는 해싱해서 저장
  password: String,
  // 서비스에서 포스트 작성 할 때마다 1씩 올라감
  thoughtCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

Account.statics.findByUsername = function (username) {
  // 객체 내장되어있는 값 사용 시 객체명.키
  return this.findOne({ "profile.username": username }).exec();
};

Account.statics.findByEmail = function (email) {
  return this.findOne({ email }).exec();
};

Account.statics.findByEmailOrUsername = function ({ username, email }) {
  return this.findOne({
    $or: [{ "profile.username": username }, { email }],
  }).exec();
};

Account.statics.localRegister = function ({ username, email, password }) {
  // 데이터 생성 시 new this() 사용
  const account = new this({
    profile: {
      username,
    },
    email,
    password: hash(password),
  });

  return account.save();
};

Account.methods.validatePassword = function (password) {
  // 함수로 받은 password 해시값과, 데이터에 담겨있는 해시값 비교
  const hashed = hash(password);
  return this.password === hashed;
};

// token 발급하기
Account.method.generateToken = function () {
  // JWT에 담을 내용
  const payload = {
    _id: this._id,
    profile: this.profile,
  };

  return generateToken(payload, "account");
};

module.exports = mongoose.model("Account", Account);
