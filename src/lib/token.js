const jwtSecret = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");

// /**
//  * JWT 토큰 생성
//  * @param {any} payload
//  * @returns {string} token
//  */

function generateToken(payload) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      jwtSecret,
      {
        // 토큰 생성 후 7일 유효
        expiresIn: "7d",
      },
      (error, token) => {
        if (error) reject(error);
        resolve(token);
      }
    );
  });
}

// JWT 토큰 디코딩
function decodeTotken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, jwtSecret, (error, decoded) => {
      if (error) reject(error);
      resolve(decoded);
    });
  });
}

// 미들웨어 생성
exports.jwtMiddleware = async (ctx, next) => {
  // access_token 읽어오기
  const token = ctx.cookies.get("access_token");
  // 토큰이 없으면 다음 작업
  if (!token) return next();

  try {
    // 토큰 디코딩 시작
    const decoded = await decodeTotken(token);

    // 토큰 만료일이 하루남았으면 토큰 재발행
    // .iat 토큰 발행 시간을 기반으로 얼마나 남았는지 판단
    if (Date.now() / 1000 - decoded.iat > 60 * 60 * 24) {
      const { _id, profile } = decoded;
      const freshToken = await generateToken({ _id, profile }, "account");
      ctx.cookies.set("access_token", freshToken, {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
      });
    }
    // 디코딩된 값 저장
    ctx.request.user = decoded;
  } catch (e) {
    // 실패
    ctx.request.user = null;
  }

  return next();
};

exports.generateToken = generateToken;
