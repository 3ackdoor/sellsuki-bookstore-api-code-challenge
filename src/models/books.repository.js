const mongoose = require("mongoose")
const Schema = mongoose.Schema

const booksSchema = new Schema({
  name: String,
  price: Number,
  quantity: Number,
})

const bookModel = mongoose.model("Book", booksSchema)

module.exports = bookModel
