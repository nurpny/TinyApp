// <%= if (locals.error) { %>
//   <p class="error">Error!</p>

//   users.find ( user => user.email ===req.body.email)

//   function authenticateUser(name,email)
//     return
app.post('/login', (req, res) => {
  const email = req.body.email;
  const pass = req.body.password;
  const user = getUserByEmailAndPass(email, pass)

  if(!user) {
    res.status(404);
    res.render("error")
  } else {
    res.cookie("user_id", user.id);
    res.redirect('/urls');
  }
});

function getUserByEmailAndPass(email, pass) {
  for(let user in users) {
    if(users[user].email === email && users[user].password === pass) {
      return users[user];
    }
  }
}

<% if(username){ %>
        <p><%= username %></p>
        <form action="/logout" method="POST"">
            <input type='submit' value="Log Out">
        </form>
    <% } else { %>
        <form action="/login" method="POST" style="margin:150px;">
        <label>Log-In</label>
        <input type="text" name="username" style="width: 100px">
        <input type="submit" value="Enter">
        </form>
        <form action="/register" method="POST" style="width: 100px">
        <label>Or </label><input type="submit" value="Register Here"></form>
    <% } %>