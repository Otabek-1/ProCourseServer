const { getUsers, addUser, updateUser, deleteUser, addTest, getTests, Login, getUserbyId } = require("./commands")
const express = require("express")
const test = require("./tes")
const cors = require("cors")
const startBot = require("./bot")
require("dotenv").config()

const app = express()
app.use(express.json())
app.use(cors())


app.get('/users', getUsers);
app.get('/user/:id', getUserbyId)
app.post('/register', addUser);
app.post('/login', Login);
app.put('/user', updateUser);
app.delete('/user/:id', deleteUser);

app.put('/add-test', addTest);
app.post('/tests', getTests);


test

app.listen(process.env.PORT || 4000, () => console.log(`Server is live on port ${process.env.PORT || 4000}`))