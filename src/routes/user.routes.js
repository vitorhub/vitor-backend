const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const UserModel = require("../models/user.models")

// insere dados se for email diferente
// verifica se senha é igual
// dificulta a senha com bcrypt
router.post("/", async (req, res)=>{
    const {name, email, password, repeatpassword } = req.body
    const salt = await bcrypt.genSalt(12) // dificultador da senha
    const passwordHash = await bcrypt.hash(password, salt)
    const dados = {
        name,
        email,
        password: passwordHash
    }
    try {
        if(password === repeatpassword){
            const jaExisteEmail = await UserModel.findOne({email: email})
            console.log(jaExisteEmail)
            if(!jaExisteEmail){
                await UserModel.create(dados)
                return res.status(200).json({msg: "criado usuario no mongo"})
            }else{
                return res.status(400).json({msg: "ja existe email"})
            }
        }else{
            return res.status(400).json({msg: "password diferente"})
        }
    } catch (error) {
        return res.status(500).json({msg: "algum erro"})
    }
})
// confere se senha modificada por bcrypt esta correta no bd
// confere se usuario existe
// verificar token para manter usuário logado
router.post("/auth/login", async (req, res)=>{
    const { email, password } = req.body
    const userByEmail = await UserModel.findOne({email: email}) // apartir da model busca no banco email
    if(!userByEmail){
        return res.status(400).json({msg: "nao encontrou usuario"})
    }
    const checkPassword = await bcrypt.compare(password, userByEmail.password) // para bcrypt compara senha
    if(!checkPassword ){
        res.status(400).json({msg: "senha invalida"})
    }
    else{
        try {
            const secret = process.env.SECRET   // verifica SECRET enviada
        const token = jwt.sign(
            {
            id: userByEmail._id
            },
            secret,
            { expiresIn: 3600 }
        )
        return res.status(200).json({ msg: "usuario ok senha ok / enviado token", token })
    } catch (error) {
        return res.status(500).json({msg: "token invalido"})
    }
    }
})


module.exports = router