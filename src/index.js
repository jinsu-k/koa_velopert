const Koa = require("koa");
const Router = require("koa-router");

const app = new Koa();
const router = new Router();

router.get("/", (ctx, next) => {
  ctx.body = "홈";
});

router.get("/about", (ctx, next) => {
  ctx.body = "소개";
});

router.get("/about/:name", (ctx, next) => {
  const { name } = ctx.params;
  ctx.body = name + "의 소개";
});

router.get("/post", (ctx, next) => {
  const { id } = ctx.request.query;
  if (id) {
    ctx.body = "포스트 #" + id;
  } else {
    ctx.body = "포스트 아이디가 없습니다.";
  }
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(4000, () => {
  console.log("heurm server is listening to port 4000");
});
