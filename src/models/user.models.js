const mongoose = require("mongoose")

const UserModel = mongoose.model("UserModel",{ // define um model de nome usermodel com tres valores
    name: String,       // name, email e password
    email: String,
    password: String,
})

module.exports = UserModel