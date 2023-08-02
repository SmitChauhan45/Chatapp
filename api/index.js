const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const User = require("../api/models/User");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieparser = require('cookie-parser');
const bcrypt = require('bcrypt');
const ws = require('ws');
const Message = require('./models/Message');
const fs = require('fs');

const bcryptSalt = bcrypt.genSaltSync(10);
const app = express();
console.log(process.env.CLIENT_URL);
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);
//middleware
app.use(express.json())
app.use(cookieparser())
app.use('/uploads', express.static(__dirname + '/uploads'));
mongoose.connect(process.env.mongoUrl);
// console.log(process.env.mongoUrl);

//need to be reviewed
async function getUserDataFromRequest(req) {
  try {
    const token = req.cookies?.token
    if (token) {
      const data = await jwt.verify(token, process.env.JWT_SECRET)
      return data;

    }
    else {
      res.status(401).json('no token')
    }
  }
  catch (err) {
    console.error(err)
     res.json({
      error: 'something went wrong'
    })
  }
}

app.get('/people',async (req, res) => {
  const users = await User.find({},{'_id' :1,username:1})
  res.json(users);
})

app.post('/logout',(req,res)=>{
  res.clearCookie('token').json('ok');
})

app.get('/messages/:userId', async (req, res) => {
  const { userId } = req.params;
  const userData = await getUserDataFromRequest(req);
  const ourUserid = userData.userId;
  // console.log({userId,ourUserid})
  const messages = await Message.find({
    sender: { $in: [userId, ourUserid] },
    recipient: { $in: [userId, ourUserid] },
  }).sort({ createdAt: 1 });
  res.json(messages);
});

//profile page ui

app.get('/profile', async (req, res) => {
  try {
    const token = req.cookies?.token
    if (token) {
      const data = await jwt.verify(token, process.env.JWT_SECRET)
      res.json(data)

    }
    else {
      res.status(401).json('no token')
    }
  }
  catch (err) {
    console.error(err)
    return res.json({
      error: 'something went wrong'
    })
  }
})

//login api req


app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;


    const user = await User.findOne({ username })
    if (!user) {
      res.status(408).json({
        login: "failed",
        message: "user not exist"
      })
    }

    //check oass is ok or not

    const passOk = bcrypt.compareSync(password, user.password)
    if (passOk) {
      const token = await jwt.sign(
        {
          userId: user._id,
          username
        },
        process.env.JWT_SECRET
      );
      res.cookie("token", token).json({
        id: user._id,
      })
    }
  } catch (error) {

  }


})

//register api req

app.post("/register", async (req, res) => {
  try {
    // console.log("first");
    const { username, password } = req.body;
    const hashedPass = bcrypt.hashSync(password, bcryptSalt);
    const createduser = await User.create({ username, password: hashedPass });


    const token = await jwt.sign(
      {
        userId: createduser._id,
        username
      },
      process.env.JWT_SECRET
    );
    // console.log(token);

    //cookkie
    res.cookie("token", token).status(201).json({
      id: createduser._id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "error while registering ",
    });
  }
});


const server = app.listen(4000, () => {
  console.log("amaru server")
})

//wss server
const wss = new ws.WebSocketServer({ server })
wss.on('connection', (connection, req) => {

  function notifyAboutOnlinePeople() {
    [...wss.clients].forEach(c => c.send(JSON.stringify(
      {
        online: [...wss.clients].map(c => ({ userId: c.userId, username: c.username }))
      }
    )))
  }

connection.isAlive = true;

connection.timer = setInterval(() => {

      connection.ping();
      connection.deathTimer = setTimeout(() => {
      connection.isAlive = false;
        clearInterval(connection.timer);
        notifyAboutOnlinePeople() ;
      connection.terminate();
        console.log("connection terminated of ", connection.username);
  }, 1000);
  }, 5 * 1000);
  connection.on('pong', () => {
    // console.log("inside pong")
    clearTimeout(connection.deathTimer);
  });

  const cookies = req.headers.cookie
  if (cookies) {
    const cookiestring = cookies.split(';').find(str => str.startsWith('token='))
    // console.log(cookiestring)
    if (cookiestring) {
      const token = cookiestring.split('=')[1]
      // console.log(token)
      if (token) {
        try {
          const { userId, username } = jwt.verify(token, process.env.JWT_SECRET)
          connection.userId = userId
          connection.username = username

        } catch (error) {
          console.log(error)
        }
      }
    }
  }

  connection.on('message', async (message) => {

    const messageData = JSON.parse(message.toString())
    const { recipient, text, file } = messageData.message;
    let filename = null;
    if (file) {
      console.log(file.data)
      const parts = file.name.split('.');
      const ext = parts[parts.length - 1];
      filename = Date.now() + '.' + ext;
      const path = __dirname+'/uploads/'+filename
      const bufferData = new Buffer.from(file.data.split(',')[1], 'base64');
      console.log(path);
      fs.writeFile(path, bufferData, () => {
        console.log("saved ")
      })
    }
      
    if (recipient && (text || file)) {

      const messageDoc = await Message.create({
        sender: connection.userId,
        recipient,
        text,
        file:filename || null,
      });
      [...wss.clients]
        .filter(c => c.userId === recipient)
        .forEach(c => c.send(JSON.stringify({ text, sender: connection.userId, _id: messageDoc._id, recipient,file:file?filename:null })));
    }
  });
  notifyAboutOnlinePeople();
  
})
