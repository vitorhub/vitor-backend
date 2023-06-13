// https://github.com/vitorhub/vitor-backend.git
// joaofalcao33
// pTPXl0h5G2ycsLLS
// mongodb+srv://joaofalcao33:<password>@cluster0.m6bx9sk.mongodb.net/?retryWrites=true&w=majority
require("dotenv").config(); // para dotenv
const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors')  // aki cors

const app = express();
app.use(express.json());

app.use((req,res,next) =>{
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE, PATCH");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  // app.use(cors());
  next();
})

// rotas da api
const userRoutes = require("./routes/user.routes")
app.use("/user", userRoutes) // toda rota /person é redirecionada para personRoutes

app.get("/", (req, res) => {
  return res.status(200).json({msg: "agora funciona nodemon"})
});

const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const port = process.env.PORT || 3001

mongoose
  .connect(
    `mongodb+srv://${dbUser}:${dbPass}@cluster0.m6bx9sk.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log("conectamos ao mongo db atlas");
    app.listen(port); // entregar uma porta
  })
  .catch((err) => {
    console.log(err);
  });
