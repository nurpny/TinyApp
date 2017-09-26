//REQUIREMENTS
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cookieSession = require("cookie-session")

//MIDDLEWARE
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: "session",
  keys: ["bluey", "orangey"],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

//FUNCTIONS
function generateShortUrl() {
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

function getUserByEmail(email) {
  for (let user in users) {
    if(users[user].email === email) {
      console.log("This works")
      return users[user];
    }
  }
}

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

// REGISTRATION ENDPOINTS
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/login");
  } else {
  res.render("register");
  }
});

app.post("/register", (req, res) => {
  const randomID = generateUserID();
  users[randomID] = {
    id: randomID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  }
  if (req.body.email === "" || req.body.password === "") {
    res.status(400);
    res.render("error");
  } else {
    req.session.user_id = users[randomID].id;
    res.redirect("/login");
  }
});

//LOGIN ENDPOINTS
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const pass = req.body.password;
  const user = getUserByEmail(email);

  if (!bcrypt.compareSync(pass, users[user.id].password)) {
    res.status(403);
    res.render("error");
  } else {
    req.session.user = user;
    res.redirect("/urls/new");
  }
});

// ROUTES
app.get("/", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/register");
  } else {
    res.redirect("/urls");
  }
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: req.session.user_id
  }
  if (!req.session.user_id) {
    res.status(401).send('Please <a href="/register">register</a> or <a href="/login">log in</a> to use TinyApp');
  } else {
    res.render("urls_index", templateVars);
  }
});

app.post("/urls", (req, res) => {
  const newLongURL = req.body.longURL;
  const newKey = generateShortUrl();
  const temp = {
    longURL: newLongURL,
    userID: req.session.user_id
  }
  urlDatabase[newKey] = temp;
  urlDatabase[newKey].userID = req.session.user_id;

  const templateVars = {
    urls: urlDatabase,
    user: req.session.user_id
  }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: {
      id: req.session.user_id,
      email: users[req.session.user_id].email,
    }
  }
  if (!req.session.user_id) {
    res.status(401).send('Please <a href="/register">register</a> or <a href="/login">log in</a> to use TinyApp');
  } else {
    console.log(templateVars);
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
  const userid = req.session.user_id;

  if (longURL.userID === userid) {
    const templateVars = {
      shortURL: req.params.id,
      longURL: longURL,
      user: req.session.user_id
    }
    res.render("urls_show", templateVars);
  } else {
    res.status(401).send('<a href="/login">Login required</a> or URL is not yours')
  }
});

app.post("/urls/:id", (req, res) => {
  const newURL = req.body.longURL;
  const newKey = req.params.id;
  const templateVars = {
    user: req.session.user_id
  }
  if (req.session.user_id) {
    urlDatabase[newKey].longURL = newURL;
    res.redirect("/urls");
  } else {
    res.status(401).send(('Not authorized to edit URLs. Return to <a href="/urls">TinyApp</a>.'))
  }
});

//DELETE OPERATION
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//LOGOUT ENDPOINT
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//LISTEN CHECK
app.listen(PORT, () => {
  console.log(`Live on port ${PORT}!`);
});