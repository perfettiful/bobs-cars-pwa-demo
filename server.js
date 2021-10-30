// Dependencies
var express = require("express");
var exphbs = require("express-handlebars");
const session = require('express-session');

const cookieParser = require('cookie-parser')
// Create an instance of the express app.
var app = express();

// Set up sessions
const sess = {
  secret: 'Super secret secret',
  resave: false,
  saveUninitialized: true,
};

app.use(session(sess));

const hbs = exphbs.create({
  helpers: {
    carLink: function (model, linkDescription) {
      if (linkDescription != "See This Car!") {
        linkDescription = linkDescription + " Get this Car!";
      }
      return "<a href='/carsforsale/" + model + "'><button>" + linkDescription + "</button></a>";
    },
    themeChange: function (color) {
      return `
      <script>
      document.querySelector('.container').style.backgroundColor = '${color}';
      document.querySelectorAll('.car').forEach(el => el.style.borderColor = '${color}');
      document.querySelector('.lowerContainer').style.backgroundColor = '${color}';
      </script>`;
    },

  }
});

const withCustomName = (req, res, next) => {
  if (!req.session.firstName) {
    //if no custom name, we can redirect or load a generic handlebar
    res.redirect('/');
  } else {
    // We call next() if the user is authenticated
    next();
  }
};

// Set the port of our application
// process.env.PORT lets the port be set by Heroku
var PORT = process.env.PORT || 8080;

// Static Directory for css/js/images
app.use(express.static("public"));

//body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set Handlebars as the default templating engine.
app.engine('handlebars', hbs.engine);
app.set("view engine", "handlebars");

// requires cookie-parser
// need cookieParser middleware before we can do anything with cookies
app.use(cookieParser());


// Data
var carsForSale = [
  {
    year: "1993",
    make: "Mazda",
    model: "Rx-7",
    price: 30000,
    image: "mazda.jpg",
    sold: false
  },
  {
    year: "2001",
    make: "Ferrari",
    model: "Modena",
    price: 120000,
    image: "ferrari.jpg",
    sold: false
  },
  {
    year: "2015",
    make: "Bugatti",
    model: "Veyron",
    price: 1700000,
    image: "bugatti.jpg",
    sold: false
  },
  {
    year: "2019",
    make: "Bentley",
    model: "Mulsanne",
    price: 305000,
    image: "mulsanne.jpg",
    sold: false
  }
];

// Routes
app.get("/carsforsale/:model", function (req, res) {

  const themeColor = req.cookies.themeColor ? req.cookies.themeColor : "red";
  for (var i = 0; i < carsForSale.length; i++) {
    if (carsForSale[i].model === req.params.model) {
      return res.render("car", {
        carsForSale: carsForSale[i],
        firstName: req.session.firstName,
        color: themeColor
      });
    }
  }
});

app.get(["/", "/carsforsale"], function (req, res) {
  const themeColor = req.cookies.themeColor ? req.cookies.themeColor : "red";
  res.render("allcars", {
    carsArray: carsForSale,
    firstName: req.session.firstName,
    color: themeColor
  });
});

app.get('/specialdeal', withCustomName, async (req, res) => {
  const themeColor = req.cookies.themeColor ? req.cookies.themeColor : "red";
  res.render("specialdeal", {
    carsForSale: carsForSale[0],
    firstName: req.session.firstName,
    color: themeColor
  });
});

// 
app.post('/api/personalize', async (req, res) => {

  const firstName = req.body.firstName;

  if (!firstName) {
    res
      .status(400)
      .json({ message: 'No Name' });
    return;
  } else {
    //save session
    req.session.save(() => {
      req.session.firstName = firstName;
      req.session.name = firstName;
      req.session.alias = firstName;

      res
        .status(200)
        .json({ message: 'Welcome ' + firstName + '!' });
    });
  }
});

app.get('/api/themeupdate/:newColor', async (req, res) => {

  const newColor = req.params.newColor;

  res
    .status(200)
    .cookie('themeColor', newColor,
      {
        maxAge: 90000,
        httpOnly: true
      })
    .json({ message: 'Theme Changed' })
});

// Start our server so that it can begin listening to client requests.
app.listen(PORT, function () {
  // Log (server-side) when our server has started
  console.log("Server listening on: http://localhost:" + PORT);
});
