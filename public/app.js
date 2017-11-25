$("#button-test").click(function(){
	alert("The button was clicked.");
});

$.getJSON("/news", function(data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $("#test-div").append("<p data-id='" + data[i]._id + "'>" + data[i].link + "</p>");
  }
});

