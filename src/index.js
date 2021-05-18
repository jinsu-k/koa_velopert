const Koa = require("koa");
const app = new Koa();

// promise 이용한 코드
// app.use((ctx, next) => {
//   console.log(1);
//   const started = new Date();
//   next().then(() => {
//     console.log(new Date() - started + "ms");
//   });
// });

// async, await 이용한 코드
app.use(async (ctx, next) => {
  console.log(1);
  const started = new Date();
  await next();
  console.log(new Date() - started + "ms");
});

app.use((ctx, next) => {
  console.log(2);
  next();
});

// app.use함수를 사용하여 미들웨어를 어플리케이션에 등록해준다.
//ctx는 웹 요청, 응답에 대한 정보를 지니고 있음
// next는 다음 미들웨어를 실행시키는 함수
app.use((ctx) => {
  ctx.body = "Hello Koa";
});

app.listen(4000, () => {
  console.log("heurm server is listening to port 4000");
});
