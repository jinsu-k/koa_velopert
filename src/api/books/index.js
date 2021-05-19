const Router = require("koa-router");

const books = new Router();
const booksCtrl = require("./books.controller");

books.get("/", booksCtrl.list);
books.get("/:id", booksCtrl.get);
books.post("/", booksCtrl.create);
books.delete("/", booksCtrl.delete);
books.delete("/:id", booksCtrl.delete);
books.put("/", booksCtrl.replace);
books.put("/:id", booksCtrl.replace);
books.patch("/", booksCtrl.update);
books.patch("/:id", booksCtrl.update);

module.exports = books;
