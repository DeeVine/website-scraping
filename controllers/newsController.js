var express = require("express");
var mongojs = require("mongojs");
var router = express.Router();
var request = require("request");
var cheerio = require("cheerio");
var mongoose = require("mongoose");
var axios = require("axios");

var db = require("../models");

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/websiteScrapeMongoose";
mongoose.connect(MONGODB_URI, {
  useMongoClient: true
});

router.get("/", function(req, res) {
  // res.send("Hello world man");
  res.render("index");
});

/* TODO: make two more routes
 * -/-/-/-/-/-/-/-/-/-/-/-/- */
// Route 1
// =======
// This route will retrieve all of the data
// from the scrapedData collection as a json (this will be populated
// by the data you scrape using the next route)
router.get("/news", function(req, res) {
  // Query: In our database, go to the animals collection, then "find" everything,
  // but this time, sort it by name (1 means ascending order)
  // Make a request call to grab the HTML body from the site of your choice

  db.Article.find({}, function(error, found) {
    // Log any errors if the server encounters one
    if (error) {
      console.log(error);
    }
    // Otherwise, send the result of this query to the browser
    else {
      console.log(found);
      res.json(found);
    }
  });


});

// Route 2
router.get("/scrape", function(req, res) {
  // Query: In our database, go to the animals collection, then "find" everything,
  // but this time, sort it by name (1 means ascending order)
  // Make a request call to grab the HTML body from the site of your choice
 
  request("http://www.rotoworld.com/", function(error, response, html) {

    // Load the HTML into cheerio and save it to a variable
    // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
    var $ = cheerio.load(html);

    // An empty array to save the data that we'll scrape
    // var results = [];

    // Select each element in the HTML body from which you want information.
    // NOTE: Cheerio selectors function similarly to jQuery's selectors,
    // but be sure to visit the package's npm page to see how it works
    $("#nba_layer .news li").each(function(i, element) {

      // console.log(element);

      var link = $(element).children().attr("href");
      console.log('link: '+link);

      var result = {};
      // result.title = $(this)
      result.title = 'placeholder for actual title';

      result.summary = 'placeholder for summary'

      //   .children("a")
      //   .text();
      result.link = link;

      // Create a new Article using the `result` object built from scraping
      db.Article
        .create(result)
        .then(function(dbArticle) {
          // If we were able to successfully scrape and save an Article, send a message to the client
          res.send("Scrape Complete");
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          res.json(err);
        });   
    });

    // Log the results once you've looped through each of the elements found with cheerio
    // console.log(results);
  });
});

router.get("/scrape3", function(req, res) {
  // Query: In our database, go to the animals collection, then "find" everything,
  // but this time, sort it by name (1 means ascending order)
  // Make a request call to grab the HTML body from the site of your choice
 
  request("http://www.rotoworld.com/headlines/nba/0/Basketball-Headlines", function(error, response, html) {

    // Load the HTML into cheerio and save it to a variable
    // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
    var $ = cheerio.load(html);

    // An empty array to save the data that we'll scrape
    // var results = [];

    // Select each element in the HTML body from which you want information.
    // NOTE: Cheerio selectors function similarly to jQuery's selectors,
    // but be sure to visit the package's npm page to see how it works
    $("#cp1_pnlArticle .pb").each(function(i, element) {
      
      // console.log(element);

      // var headline = $(element).children('.player a');
      // console.log(headline);

      var link = $(element).find('.player a').attr("href");
      console.log('link: '+link);

      var title = $(element).find('.player a').text();
      console.log('text: '+title);

      var summary = $(element).find('.impact').text();
      console.log('summary: '+summary);

      var result = {};
      // result.title = $(this)
      result.title = title;

      result.summary = summary;

      result.link = link;

      console.log(result);

      // Create a new Article using the `result` object built from scraping
      db.Article
        .create(result)
        .then(function(dbArticle) {
          // If we were able to successfully scrape and save an Article, send a message to the client
          res.send("Scrape Complete");
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          res.json(err);
        });   
    });

    // Log the results once you've looped through each of the elements found with cheerio
    // console.log(results);
  });
});

router.get("/news/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article
    .findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

router.post("/news/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note
    .create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Export routes for server.js to use.
module.exports = router;
