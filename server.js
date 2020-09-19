const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
var winston = require('winston');

const app = express()

//allowing access to only trusted domains
var whitelist = ['http://example.com', 'http://127.0.0.1:5500']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

app.use(cors(corsOptions));

app.use(express.urlencoded({extended:true}));
app.use(express.json());

//sets all useful headers by default to improve security
app.use(helmet())

app.get('/', (req, res) => {
  res.cookie('session', '1', {
    //prevents document.cookie() API to access cookie,thus prevents CSRF attack
    httpOnly: true, 
    expires: new Date(Date.now() + 100045000),
  })
  //will be enabled if site is requesting over https
  //send cookie to server only with https
  res.cookie('session', '1', {secure : true}) 
  //prevents XSS
  res.set({
    'Content-Security-Policy':"script-src 'self'"
  })
  res.send('Hello World!')
})

app.post('/secret', (req, res) => {
  const { userInput } = req.body;
  console.log(userInput);
  if (userInput) {
    winston.log('info', 'user input: ' + userInput);
    res.status(200).json('success');
  } else {
    winston.error('This guy is messing with us:' + userInput);
    res.status(400).json('incorrect submission')
  }
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))