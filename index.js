require('dotenv').config();
console.log("Hasan builds backend")


const express = require('express');
const app = express()
const port = 4000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/twitter', (req,response) => {
    res.send('1hasan')
})

app.get('/login', (req,res) => {
    res.send("<h1>Login here</h1>")
})

app.get('/youtube', (req,res) => {
    res.send("<h2>Youtube</h2>")
})

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${port}`)
})