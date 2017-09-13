function generateRandomString(length) {
  var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  var randomstring = '';
    for (var i = 0; i < 6; i++) {
      randomstring += chars.charAt(Math.floor(Math.random() * length));
    }
    console.log(randomstring);
  };
  generateRandomString(19);