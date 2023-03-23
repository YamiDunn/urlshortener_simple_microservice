require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { json, urlencoded } = require("body-parser");
const dns = require("dns");
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

//Utils
const options = {
  /*Setting family as 6 i.e. IPv6
  family: 6,
  hints: dns.ADDRCONFIG | dns.V4MAPPED,*/
  //set all
  all: true,
};

const longUrl = [
  {
    Url: {
      longU: "something",
      shortU: "SmallSomething",
      urlId: 0,
    },
  },
];
var index = Number();
var urlCheck = String();
var regE = /^(ftp|http|https):\/\//;
const validateUrl = (value) => {
  return /^(ftp|http|https):\/\/[^ "]+$/.test(value);
  // next one isnt working, but recorded for the complex regex
  //return /^(?:(?:https?|ftp):)(?:\\S+(?::\\S*)?@)?(?:(?!(?:10|127)(?:\\.\\d{1,3}){3})(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))(?::\\d{2,5})?(?:[/?#]\\S*)?$/i.test(value);
};

app.route("/api/shorturl").post((req, res, next) => {
  let originalUrl = req.body.url;
  if (validateUrl(originalUrl)) {

    urlCheck = originalUrl;
    let checkUrl = originalUrl;

    if (checkUrl[checkUrl.length-1] == '/') {
      checkUrl = checkUrl.split('');
      checkUrl.pop();
      checkUrl = checkUrl.join('');
    } else {
      console.log('error, testing the checkUrl');
    };

    let dnsVerify = checkUrl.replace(regE, '');
    dns.lookup(dnsVerify, options, (err, addresses) => {
      if (err) {
        console.log("error founded, dns");
      } else {
        console.log("addresses: %j", addresses);
      }
    });

    try {
      let temp = longUrl.find((el) => el.longU == urlCheck);
      if (temp) {
        res.json({ original_url: temp.longU, short_url: temp.shortU });
      } else {
        let gNumber = parseInt(Math.random() * 99);
        longUrl.push({
          longU: originalUrl,
          shortU: gNumber,
          urlId: index + 1,
        });
        index = index + 1;
        res.json({ original_url: originalUrl, short_url: gNumber });
        next();
      }

      //res.json({ longurl: urlCheck });
    } catch (err) {
      console.log(err);
      res.status(500).json("Server Error");
    }
  } else {
    res.status(400).json({ "error:": "invalid url" });
  }
});

app.get("/api/shorturl", (req, res) => {
  res.redirect("/");
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
