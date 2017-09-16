const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 8080;
const bcrypt = require('bcrypt');

app.set("view engine", "ejs");
app.use(cookieParser());

app.use((req, res, next) => {
  if(req.cookies.user_id) {
    req.user = users[req.cookies.user_id]; // check that it's cctually valid used id
  } else {
    if(req.url == "/login" || req.url == "/register") {
      next();
    } else {
    // Bail out?! Maybe not if we're asking for /login or /register
      res.redirect("/login");
    }
  }
  next();
})

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

function generateRandomString() {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  var randomstring = "";
  for (var i = 0; i < 6; i++) {
    randomstring += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return randomstring;
};

function generateUserID() {
  var chars = "abcdefghijklmnop1234";
  var randomID = "";
  for (var i = 0; i < 4; i++) {
    randomID += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return randomID;
};

function getUserByEmailAndPass(email, pass) {
  for (let user in users) {
    if(users[user].email === email && users[user].password === pass) {
      return users[user];
    }
  }
}

const users = {
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

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "user1"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2"
  }
};

app.get("/", (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect("/register");
  } else {
    res.redirect("/urls/new");
  }
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  console.log(templateVars);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  console.log(templateVars);
  res.render("urls_new", templateVars);
});

app.post("/urls/", (req, res) => {
  // adding what's in the input into urlDatabase
  const newURL = req.body.longURL;
  const newKey = generateRandomString();
  urlDatabase[newKey] = newURL;
  // urlDatabase[newKey].userID = req.cookies.user_id;
  // console.log(urlDatabase);
  // redirecting
  let templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  }; console.log(templateVars);
  res.render("urls_index", templateVars);
});

// app.param("id", (id, req, res, next) => {
//   req.longURL = urlDatabase[id].longURL;
// })

app.get("/urls/:id", (req, res) => {
  let longURL = urlDatabase[req.params.id];
  let templateVars = {
    shortURL: req.params.id,
    longURL: longURL,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const newURL = req.body.longURL;
  const newKey = req.params.id;
  urlDatabase[newKey].longURL = newURL;
  res.redirect("/urls");
});

// Display the Username
app.post("/login", (req, res) => {
  const email = req.body.email;
  const pass = req.body.password;
  const user = getUserByEmailAndPass(email, pass)

  if (!user || req.body.email === "" || req.body.password === "") {
    res.status(403);
    res.render("error");
    } else {
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  }
});

// Implement /logout endpoint
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls/new");
});

// Create a GET /Register endpoint
app.post("/register", (req, res) => {
  var randomID = generateUserID();
  users[randomID] = {
    id: randomID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  }
  console.log(randomID);
  // Send an error code if email or password fields are blank
  if (req.body.email === "" || req.body.password === "") {
    res.status(400);
    res.render("error");
  }
  // Set a user_id cookie containing newly generated ID
  res.cookie("user_id", randomID);      // FIXME
  // Redirect
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

// Create a Login Page
app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});