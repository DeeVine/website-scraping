var express = require("express");
var mongojs = require("mongojs");
var router = express.Router();

var databaseUrl = "rotoscraper";
var collections = ["collectionPlaceholder"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

// Import the model (cat.js) to use its database functions.
// var cat = require("../models/cat.js");

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

  db.news.find({}, function(error, found) {
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
// =======
// When you visit this route, the server will
// scrape data from the site of your choice, and save it to
// MongoDB.
// TIP: Think back to how you pushed website data
// into an empty array in the last class. How do you
// push it into a MongoDB collection instead?
router.get("/scrape", function(req, res) {
  // Query: In our database, go to the animals collection, then "find" everything,
  // but this time, sort it by name (1 means ascending order)
  // Make a request call to grab the HTML body from the site of your choice
 
  request("http://www.rotoworld.com/", function(error, response, html) {

    // Load the HTML into cheerio and save it to a variable
    // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
    var $ = cheerio.load(html);

    // An empty array to save the data that we'll scrape
    var results = [];

    // Select each element in the HTML body from which you want information.
    // NOTE: Cheerio selectors function similarly to jQuery's selectors,
    // but be sure to visit the package's npm page to see how it works
    $("#nba_layer .news li").each(function(i, element) {
      
      var link = $(element).children().attr("href");
      // console.log(link);
      // var title = $(element).children().text();

      // Save these results in an object that we'll push into the results array we defined earlier
      results.push({
        // title: title,
        link: link
      });
      
      //insert into db
      db.newsitems.insert({
      'link': link,
      })

    });

    // Log the results once you've looped through each of the elements found with cheerio
    console.log(results);
  });
});

// Export routes for server.js to use.
module.exports = router;
