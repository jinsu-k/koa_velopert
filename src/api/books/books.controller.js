// books API 기능 구현
const Book = require("models/book");
//Request Body 검증 라이브러리
const Joi = require("joi");
const {
  Types: { ObjectId },
} = require("mongoose");

exports.create = async (ctx) => {
  // requset body에서 값들을 추출
  const { title, authors, publishedDate, price, tags } = ctx.request.body;

  const book = new Book({
    title,
    authors,
    publishedDate,
    price,
    tags,
  });

  try {
    await book.save();
  } catch (e) {
    return ctx.throw(500, e);
  }

  ctx.body = book;
};

exports.list = async (ctx) => {
  let books;

  try {
    // .exec() 를 꼭 붙여줘야 실제 DB에 요청이 들어감
    books = await Book.find().sort({ _id: -1 }).limit(3).exec();
  } catch (e) {
    return ctx.throw(500, e);
  }

  ctx.body = books;
};

exports.get = async (ctx) => {
  const { id } = ctx.params;

  let book;

  try {
    book = await Book.findById(id).exec();
  } catch (e) {
    if (e.name == "CastError") {
      ctx.status = 400;
      return;
    }
    return ctx.throw(500, e);
  }

  if (!book) {
    ctx.status = 404;
    ctx.body = { message: "book not found" };
    return;
  }

  ctx.body = book;
};

exports.delete = async (ctx) => {
  const { id } = ctx.params;

  try {
    await Book.findByIdAndRemove(id).exec();
  } catch (e) {
    if (e.name == "CastError") {
      ctx.status = 400;
      return;
    }
  }

  ctx.status = 204;
};

exports.replace = async (ctx) => {
  const { id } = ctx.params;

  if (!ObjectId.isValid(id)) {
    ctx.status = 400;
    return;
  }

  const schema = Joi.object().keys({
    // required()를 붙여주면 필수 항목이라는 의미
    title: Joi.string().required(),
    authors: Joi.array().items(
      Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
      })
    ),
    publishedDate: Joi.date().required(),
    price: Joi.number().required(),
    tags: Joi.array().items(Joi.string().required()),
  });

  const result = Joi.validate(ctx.request.body, schema);

  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

  let book;

  try {
    // (아이디, 변경 할 값, 설정)
    book = await Book.findByIdAndUpdate(id, ctx.request.body, {
      // 데이터가 존재하지 않으면 새로 만들어줌
      upsert: true,
      // 이 값을 안넣으면 ctx.body = book 했을 때 업데이트 전의 데이터를 보여줌
      new: true,
    });
  } catch (e) {
    return ctx.throw(500, e);
  }

  ctx.body = book;
};

exports.update = async (ctx) => {
  const { id } = ctx.params;

  if (!ObjectId.isValid(id)) {
    ctx.status = 400;
    return;
  }

  let book;

  try {
    book = await Book.findByIdAndUpdate(id, ctx.request.body, {
      new: true,
    });
  } catch (e) {
    return ctx.throw(500, e);
  }

  ctx.body = book;
};
