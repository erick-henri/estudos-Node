const express = require("express")
const exphbs = require('express-handlebars')
const conn = require('./db/conn')

const User = require('./models/User')
const Adress = require('./models/Adress')
const app = express()

app.engine('handlebars', exphbs.engine())
app.set('view engine', 'handlebars')

app.use(express.static('public'))

app.use(
    express.urlencoded({
        extended: true
    })
)

app.use(express.json())

app.get('/', async (req, res) => {

    const users = await User.findAll({ raw: true })

    console.log(users)
    res.render('home', { users: users })
})


app.get('/users/create', (req, res) => {
    res.render('adduser')
})


app.post('/users/create', async (req, res) => {
    const name = req.body.name
    const occupation = req.body.occupation
    let newsletter = req.body.newsletter

    if (newsletter === 'on') {
        newsletter = true
    } else {
        newsletter = false
    }
    console.log(req.body)
    await User.create({ name, occupation, newsletter })
    res.redirect('/')
})

app.get('/users/:id', async (req, res) => {
    const id = req.params.id

    const user = await User.findOne({ raw: true, where: { id: id } })

    console.log(user)

    res.render('userview', { user })
})

app.post('/user/delete/:id', async (req, res) => {
    const id = req.params.id

    await User.destroy({ where: { id: id } })

    res.redirect('/')
})

app.get('/users/edit/:id', function (req, res) {
    const id = req.params.id
  
    User.findOne({
      include: Adress,
      where: {
        id: id,
      },
    })
      .then((user) => {
        res.render('useredit', { user: user.get({ plain: true }) })
        console.log(JSON.stringify(user, null, 2));
      })
      .catch((err) => console.log(err))
  })

app.post('/users/update', async(req,res)=>{
    const id = req.body.id
    const name = req.body.name
    const occupation = req.body.occupation
    let  newsletter = req.body.newsletter

    if (newsletter ==="on"){
        newsletter = true
    }else{
        newsletter = false
    }

    const userData = {
        id,
        name,
        occupation,
        newsletter
    }
    await User.update(userData, {where: {id:id}})

    res.redirect('/')
})


app.post('/address/create', async (req,res)=>{
    const UserId = req.body.UserId
    const street = req.body.street
    const city = req.body.city
    const number = req.body.number
    
    const addres = {
        UserId,
        street,
        city,
        number
    }

    await Adress.create(addres)

    res.redirect(`/users/edit/${UserId}`)
})


app.post('/address/delete', async(req,res)=>{
    const UserId = req.body.UserId
    const id = req.body.id

    await Adress.destroy({where: {id: id}})

    res.redirect(`/users/edit/${UserId}`)
})


conn.
sync()
//sync({force: true})
.then(() => {
    app.listen(8080)
}).catch(err => console.log(err))

