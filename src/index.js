const express = require("express")

const app = express()
const mongoose = require("mongoose")
const bookRepository = require("./models/books.repository")

app.use(express.json())

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/node-api-101", {
    useNewUrlParser: true,
  })
  .then(() => console.log("DB Connected!"))

app.get("/", (req, res) => {
  res.json({ message: "Hello!!!!" })
})
// update book
app.put("/update-book", async (req, res) => {
  const payload = req.body
  const resp = await bookRepository.findOne({ _id: payload._id })
  const result = Object.assign(resp, { ...payload, name: payload.name })
  await resp.save().then(() => console.log("update !!!!"))
  res.json(result)
  res.status(200).end()
})

// show all book
app.get("/books", (req, res) => {
  //console.log('books : ' , )
  res.json({ message: "list all books" })
})

// insert book
app.post("/add-new-book", async (req, res) => {
  const payload = req.body
  const book = new bookRepository(payload)
  console.log("res : ", book)
  await book.save().then(() => console.log("create !!!!"))
  res.json({
    payload,
  })
  res.status(200).end()
})

// buy book
app.post("/purchase", async (req, res) => {
  const payload = req.body
  const purchase = async () => {
    return await Promise.all(
      payload.map(async data => {
        let array = []
        const amount = await bookRepository.findOne({ name: data.name })
        if (!amount)
          // why it does not throw error msg ??
          throw new Error(
            { message: "This product does not exist", statusCode: 404 },
            res.status(404).end()
          )

        if (!data.quantity || data.quantity < 1)
          throw (new Error({
            message: "ERROR_INVALID_ORDER_NUMBER",
            statusCode: 404,
          }),
          res.status(404).end())

        if (amount.quantity < data.quantity)
          throw (new Error({
            message: "This product is currently out of stock and unavailable",
            statusCode: 404,
          }),
          res.status(404).end())

        await Object.assign(amount, {
          ...data,
          quantity: amount.quantity - data.quantity,
        })
        await amount.save().then(() => console.log("purchase !!!!"))

        const result = await Object.assign(amount, {
          ...data,
          quantity: data.quantity,
        })

        array = [...array, result]

        return array
      })
    )
  }

  purchase().then(data => {
    let amount = 0,
      price = 0,
      discount = 0,
      resultDiscount = 0,
      total = 0,
      maxDiscountForBook = 0

    if (data.length === 2) discount = 0.1
    if (data.length === 3) discount = 0.2
    if (data.length === 4) discount = 0.3
    if (data.length === 5) discount = 0.4
    if (data.length === 6) discount = 0.5
    if (data.length === 7 || data.length === 8) discount = 0.6

    // find minimum number in 2 dimensions array
    let minNumber = Math.min.apply(
      Math,
      data.map(o => {
        return o.map(k => {
          return k.quantity
        })
      })
    )

    for (let m = 0; m < data.length; m++) {
      amount = amount + data[m][0].quantity
      price = price + data[m][0].quantity * 100
    }

    maxDiscountForBook = data.length * 100
    resultDiscount = Math.round(minNumber * discount * maxDiscountForBook)
    total = price - resultDiscount

    res.json({
      รวม: `${amount} เล่ม`,
      ราคารวม: `${price} บาท`,
      ส่วนลด: `${resultDiscount} บาท`,
      รวมสุทธิ: `${total} บาท`,
    })
  })
})

app.listen(9000, () => {
  console.log("Application is running on port 9000")
})
