const Router = require("koa-router");
const auth = new Router();
const authCtrl = require("./auth.controller");

auth.post("/register/local", authCtrl.localRegister);
auth.post("/login/local", authCtrl.localLogin);
// :key(email|username) => key 파라미터 email or username 만 허용
auth.get("/exists/:key(email|username)/:value", authCtrl.exists);
auth.post("/logout", authCtrl.logout);
auth.get("/check", authCtrl.check);

module.exports = auth;
