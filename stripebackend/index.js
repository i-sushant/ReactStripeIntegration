const cors = require('cors');
const express = require('express')
require('dotenv').config()
const stripe = require("stripe")(process.env.SECRET_KEY);
//TODO add a stripe key
const uuid = require('uuid/v4')


const app = express()

//middleware

app.use(express.json())
app.use(cors())

//routes
app.get('/', (req,res) => {
    res.send('It works at my website');
})


app.post('/payments', (req,res) => {
    const {product, token } = req.body;
    console.log("Product", product);
    console.log("Price", product.price);
    const idempotencyKey = uuid()

    return stripe.customers.create({
        email: token.email,
        source: token.id
    }).then(customer => {
        stripe.charges.create({
            amount: product.price * 100,
            currency: 'usd',
            customer:customer.id,
            receipt_email:token.email,
            description:`purchase of product.name`,
            shipping: {
                name : token.card.name,
                address : {
                    country : token.card.address_country
                }
            }
        }, {idempotencyKey})
    })
    .then(result => res.status(200).json(result))
    .catch(err => console.log(err))
})
//listen

app.listen(8282, '127.0.0.1', () => console.log('Listening at 8282'));