//requiring dependencies
const express = require('express')
let bcrypt = require('bcryptjs')
let salt = bcrypt.genSaltSync(14);
let bodyParser = require('body-parser')
let generateToken = require('./utils/generateToken');
let cookieParser = require('cookie-parser');
let token;

//dabatase helpers
const User = require('./data/dbhelpers');



//set up server and port
const server = express();
server.use(bodyParser.json())
server.use(cookieParser())
const PORT = process.env.PORT || 5000;

// Fetch users. To-do: protect this endpoint
server.get('/', (req, res)=>{
    if(res.cookie){
        if(req.cookies.auth){
    User.find().then(users=> res.status(200).json({users: users}))
}else {
    res.status(401).json({message: `You're not cleared for this.`})
}
} else {
    res.status(401).json({message: `You shouldn't be here`})
}
})

//Registration endpoint
server.post('/register', (req, res)=> {
    console.log(req.body);
    let hash = bcrypt.hashSync(req.body.password, salt);
    req.body.password = hash;
    User.insert(req.body).then(users=> res.status(200).send(`Successfully added ${req.body.username}`))
});

server.post('/login', (req, res)=> {
    let {username, password} = req.body;
    User.findbyUsername(username)
        .then(user => {
            if(user && bcrypt.compareSync(password, user.password)) {
                token = generateToken(user)
                res.cookie('auth', token);
                res.status(200).json({message: `Welcome ${user.username}! Here's your token:`, token})
            }
            else {
                res.status(401).json({message: `Whoa there, chief. Something's wrong with your creds. I'm gonna need to see ID.`})
            }
        })
        .catch(err=> res.json({error: err.message}))
})

server.get('/logout', (req, res)=> {
    res.clearCookie('auth', token)
    res.status(200).json({message: `You're now logged out`})
})

// server.get('/:id', (req, res)=> {
//     const id = req.params.id;
//     User.findbyid(id).then(user=>res.status(200).send(user))
// })

server.listen(PORT, ()=> {
    console.log(`Server is now active on localhost:${PORT}`)
})