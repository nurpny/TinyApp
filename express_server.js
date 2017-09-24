const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
// const bcrypt = require('bcrypt');

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

//DATA OBJECTS
var users = {
  user1: {
    id: "user1",
    email: "user1@example.com",
    password: "purplerain"
  },
  user2: {
    id: "user2",
    email: "user2@example.com",
    password: "greenapple"
  }
}

var urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "user1"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2"
  }
};

//FUNCTIONS
function generateRandomString() {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  var randomstring = "";
  for (var i = 0; i < 6; i++) {
    randomstring += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return randomstring;
};

function generateUserID() {
  var chars = "1234567890";
  var randomID = "";
  for (var i = 0; i < 3; i++) {
    randomID += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return "user" + randomID;
};

function getUserByEmailAndPass(email, pass) {
  for (let user in users) {
    if(users[user].email === email && users[user].password === pass) {
      return users[user];
    }
  }
}

// REGISTRATION ENDPOINTS
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  var randomID = generateUserID();
  users[randomID] = {
    id: randomID,
    email: req.body.email,
    password: req.body.password
  }
  if (req.body.email === "" || req.body.password === "") {
    res.status(400);
    res.render("error");
  } else
    res.cookie("user_id", randomID);
    res.redirect("/login");
});

//LOGIN ENDPOINTS
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const pass = req.body.password;
  const user = getUserByEmailAndPass(email, pass)

  if (!user || req.body.email === "" || req.body.password === "") {
    res.status(403);
    res.render("error");
  } else {
    res.cookie("user_id", user.id);
    res.redirect("/urls/new");
  }
});

// ROUTES
app.get("/", (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect("/login");
  } else {
    res.redirect("/urls");
  }
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  }
  if (!req.cookies.user_id) {
    res.status(404).send('Please <a href="/register">register</a> or <a href="/login">log in</a> to use TinyApp');
  } else {
    res.render("urls_index", templateVars);
  }
});

app.post("/urls", (req, res) => {
  const newLongURL = req.body.longURL;
  const newKey = generateRandomString();
  const temp = {
    longURL: newLongURL,
    userID: req.cookies.user_id
  }
  urlDatabase[newKey] = temp;
  urlDatabase[newKey].userID = req.cookies.user_id;

  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  }
  if (!req.cookies.user_id) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

//REDIRECT ROUTES
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) {
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.status(404).send('Return to <a href="/urls">TinyApp</a>')
  }
});

app.get("/urls/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  const shortURL = req.params.id;
  const userid = req.cookies["user_id"];

  if (longURL.userID === userid) {
    const templateVars = {
      shortURL: req.params.id,
      longURL: longURL,
      user: users[req.cookies["user_id"]]
    }
    res.render("urls_show", templateVars);
  } else {
    res.status(403).send('<a href="/login">Login required</a> or URL is not yours')
  }
});

app.post("/urls/:id", (req, res) => {
  const newURL = req.body.longURL;
  const newKey = req.params.id;
  const templateVars = {
    user: users[req.cookies["user_id"]]
  }
  if (req.cookies.user_id) {
    urlDatabase[newKey].longURL = newURL;
    res.redirect("/urls");
  } else {
    res.status(403).send(('Not authorized to edit URLs. Return to <a href="/urls">TinyApp</a>.'))
  }
});

//DELETE OPERATION
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//LOGOUT ENDPOINT
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//LISTEN CHECK
app.listen(PORT, () => {
  console.log(`Live on port ${PORT}!`);
});