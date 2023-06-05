const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const UserModel = require("../models/user.models");

// CREATE usuario no banco se email diferente
// verifica se senha é igual
// dificulta a senha com bcrypt
router.post("/", async (req, res) => {
  const { name, email, password, repeatpassword } = req.body;
  const salt = await bcrypt.genSalt(12); // dificultador da senha
  const passwordHash = await bcrypt.hash(password, salt);
  const dados = {
    name,
    email,
    password: passwordHash,
  };
  try {
    if (password === repeatpassword) {
      const jaExisteEmail = await UserModel.findOne({ email: email });
      console.log(jaExisteEmail);
      if (!jaExisteEmail) {
        await UserModel.create(dados);
        return res.status(200).json({ msg: "criado usuario no mongo" });
      } else {
        return res.status(400).json({ msg: "ja existe email" });
      }
    } else {
      return res.status(400).json({ msg: "password diferente" });
    }
  } catch (error) {
    return res.status(500).json({ msg: "algum erro" });
  }
});
// UPDATE password e/ou name exigindo nova senha
// confere senha antes de nova senha
router.patch("/update/:id", async (req, res) => {
  const id = req.params.id;
  const { name, email, password, newPassword } = req.body;
  const userById = await UserModel.findOne({ _id: id });
  const checkPassword = await bcrypt.compare(password, userById.password);
  const salt = await bcrypt.genSalt(12); // dificultador da senha
  const passwordHash = await bcrypt.hash(newPassword, salt); // novo password vai com hash
  if (checkPassword && userById) {
  if (password !== newPassword) {
      // se password confere e achou id pode atualizar o novopass
      const person = {
        name,
        email,
        password: passwordHash,
      };
      const updatedPerson = await UserModel.updateOne({ _id: id }, person);
      res.status(200).json({ msg: "banco atualizou name email e newpassword" });
    } else {
      res.status(401).json({ msg: "password é igual" });
    }
  }
});

// DELETE by email, find id and delete it
// Compara senha vindo de bcrypt
router.delete("/deletar", async (req, res) => {
  const { email, password } = req.body;
  const userByEmail = await UserModel.findOne({ email: email });
  const checkPassword = await bcrypt.compare(password, userByEmail.password);
  if (checkPassword) {
    try {
      await UserModel.deleteOne({ _id: userByEmail.id });
      return res.status(200).json({ msg: "deletou" });
    } catch (error) {
      return res.status(401).json({ msg: "nao deletou" });
    }
  }
});

// Private route
// Verify token and expiration time
router.get("/private/:id", checkToken, async (req, res) => {
  const id = req.params.id;
  const user = await UserModel.findById(id, "-password"); // returns on user id without password
  if (!user) {
    return res.status(404).json({ msg: "usuario nao encontrado" });
  }
  res.status(200).json({ user });
});

// MIDDLEWARE
function checkToken(req, res, next) {
    // este é um middleware
    const authHeader = req.headers["authorization"]; // PEGA da req.headers indice authorization
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ msg: "token invalido" });
    }
    try {
      const secret = process.env.SECRET;
      jwt.verify(token, secret); // verifica o token na secret
      next();
    } catch (error) {
      res.status(400).json({ msg: "token do try invalido ou expirou" });
    }
  }

// LOGIN confere se senha modificada por bcrypt esta correta no bd
// confere se usuario existe
// verificar token para manter usuário logado
// envia msg token id
router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const userByEmail = await UserModel.findOne({ email: email }); // apartir da model busca no banco email
  if (!userByEmail) {
    return res.status(400).json({ msg: "nao encontrou usuario" });
  }
  const checkPassword = await bcrypt.compare(password, userByEmail.password); // para bcrypt compara senha
  if (!checkPassword) {
    res.status(400).json({ msg: "senha invalida" });
  } else {
    try {
      const secret = process.env.SECRET; // verifica SECRET enviada
      const token = jwt.sign(
        {
          id: userByEmail._id,
        },
        secret,
        { expiresIn: 60 }
      );
      return res
        .status(200)
        .json({ msg: "usuario senha token id", token, _id: userByEmail.id });
    } catch (error) {
      return res.status(500).json({ msg: "token invalido" });
    }
  }
});

module.exports = router;
