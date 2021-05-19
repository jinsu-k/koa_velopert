//.env에서 환경변수 불러오기
require("dotenv").config();

const Koa = require("koa");
const Router = require("koa-router");

const app = new Koa();
const router = new Router();
const api = require("./api");

const mongoose = require("mongoose");
const bodyParser = require("koa-bodyparser");

//Node 네이티브 Promise 사용 => mongoose에서 데이터베이스에 요청 할 때 Promise를 사용 할 수 있는데
//어떤 Promise를 사용 할 지 알려줘야함
mongoose.Promise = global.Promise;

//mongodb 연결
mongoose
  .connect(process.env.MONGO_URI, {
    // useMongoClient를 사용하니 WARNING 에러가 나온다
    // useMongoClient: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((response) => {
    console.log("Successfully connected to mongodb");
  })
  .catch((e) => {
    console.error(e);
  });

//PORT번호가 설정되어 있지 않으면 4000번 사용
const port = process.env.PORT || 4000;

//bodyPaser는 라우터 코드보다 상단에 있어야함
app.use(bodyParser());

router.use("/api", api.routes());
app.use(router.routes()).use(router.allowedMethods());

app.listen(4000, () => {
  console.log("heurm server is listening to port" + port);
});
