const Joi = require("joi");
const Account = require("models/Account");

// 로컬 회원가입
exports.localRegister = async (ctx) => {
  // 데이터 검증
  const schema = Joi.object().keys({
    username: Joi.string().alphanum().min(4).max(15).required(),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(6),
  });

  // 이렇게 작성하면 TypeError: Joi.validate is not a function 에러가 발생한다
  // const result = Joi.validate(ctx.request.body, schema);
  // 문법이 바뀌어서 아래처럼 작성해 줘야한다
  const result = schema.validate(ctx.request.body);

  // 검증 실패 시
  if (result.error) {
    ctx.status = 400;
    return;
  }

  // 아이디, 이메일 중복 체크
  let existing = null;
  try {
    existing = await Account.findByEmailOrUsername(ctx.request.body);
  } catch (e) {
    ctx.throw(500, e);
  }

  if (existing) {
    // 중복되는 아이디/이메일 있으면 409 에러
    ctx.status = 409;

    // 어떤 값이 중복인지 출력
    ctx.body = {
      key: existing.email === ctx.request.body.email ? "email" : "username",
    };
    return;
  }

  // 계정 생성
  let account = null;
  try {
    account = await Account.localRegister(ctx.request.body);
  } catch (e) {
    ctx.throw(500, e);
  }

  // 토큰 발급!
  let token = null;
  try {
    token = await account.generateToken();
  } catch (e) {
    ctx.throw(500, e);
  }

  // httpOnly 속성 적용 후 쿠키 설정
  // maxAge => 최대 7일 생성유지
  ctx.cookies.set("access_token", token, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
  // 프로필 정보로 응답
  ctx.body = account.profile;
};

// 로컬 로그인
exports.localLogin = async (ctx) => {
  // 데이터 검증
  const schema = Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  const result = schema.validate(ctx.request.body);

  if (result.error) {
    ctx.status = 400;
    return;
  }

  const { email, password } = ctx.request.body;

  let account = null;
  try {
    //이메일로 계정 찾기
    account = await Account.findByEmail(email);
  } catch (e) {
    ctx.throw(500, e);
  }

  if (!account || !account.validatePassword(password)) {
    // 유저 및 비밀번호가 존재 하지 않으면 403 에러
    ctx.status = 403;
    return;
  }

  // 토큰 발급!
  let token = null;
  try {
    token = await account.generateToken();
  } catch (e) {
    ctx.throw(500, e);
  }

  // httpOnly 속성 적용 후 쿠키 설정
  // maxAge => 최대 7일 생성유지
  ctx.cookies.set("access_token", token, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  ctx.body = account.profile;
};

// 이메일 / 아이디 존재유무 확인
exports.exists = async (ctx) => {
  const { key, value } = ctx.params;
  let account = null;

  try {
    // key에 따라서 findByEmail or findByUsername 실행
    account = await (key === "email"
      ? Account.findByEmail(value)
      : Account.findByUsername(value));
  } catch (e) {
    ctx.throw(500, e);
  }

  ctx.body = {
    exists: account !== null,
  };
};

// 로그아웃
exports.logout = async (ctx) => {
  ctx.cookies.set("access_token", null, {
    maxAge: 0,
    httpOnly: true,
  });
  ctx.status = 204;
};
