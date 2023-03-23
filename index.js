require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { urlencoded } = require("body-parser");
const dns = require("dns");
const { url } = require("inspector");
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
      longU: "",
      shortU: "",
      urlId: 0,
      original_url: "",
    },
  },
];
var index = Number();
var urlCheck = String();
var regE = /^https?:\/\/(.+?)\/?$|^ftp?:\/\/(.+?)\/?$/;
const validateUrl = (value) => {
  return /^(ftp|http|https):\/\/[^ "]+$/.test(value);
};

app.route("/api/shorturl").post((req, res) => {
  let originalUrl = req.body.url;
  let testDns = originalUrl;

  let dnsVerify = testDns.replace(regE, '$1');
  dns.lookup(dnsVerify, options, (err, addresses) => {
    if (err) {
      console.log("Dns not found");
      return;
    } else {
      console.log("addresses: %j", addresses);
    }
  });
  if (validateUrl(originalUrl)) {
    urlCheck = originalUrl;
    urlCheck = urlCheck.replace(/\/$/, '','');
    /*if (urlCheck[urlCheck.length - 1] !== "/") {
      urlCheck = urlCheck + "/";
      console.log(urlCheck, "you are here, urlcheck");
    } else {
      console.log("String already have a slash");
    };*/
    try {
      let temp = longUrl.find((el) => el.longU == urlCheck);
      if (temp) {
        res.json({ original_url: temp.longU, short_url: temp.shortU });
      } else {
        let gNumber = parseInt(Math.random() * 99);
        longUrl.push({
          longU: urlCheck,
          shortU: gNumber,
          urlId: index + 1,
          original_url: originalUrl,
        });
        index = index + 1;
        res.json({ original_url: originalUrl, short_url: gNumber });
      }
      console.log(longUrl);
    } catch (err) {
      console.log(err);
      res.status(500).json("Server Error");
    }
  } else {
    res.status(400).json({ "error": "invalid url" });
  }
});

app.get("/api/shorturl/:short_url(\\d+)", (req, res) => {
  let short_url = req.params.short_url;
  let temp = longUrl.find((el) => el.shortU == short_url );
  if (temp) {
    res.redirect(temp.original_url);
  } else {
    console.log("Redirection url failed");
  };
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
