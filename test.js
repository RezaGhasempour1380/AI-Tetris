// Initialize a variable with a default value
var result_v = "Default value";

// Function to get the move from the AI
function get_move(data) {
    // Make an AJAX request to the AI server
    $.ajax({
        url: "http://localhost:5000/tetris_ai", // The URL of the AI server
        type: "POST", // The type of HTTP request
        contentType: "application/json", // The type of data being sent
        data: data, // The data being sent to the server
        async: false, // Make the request synchronous
        success: function(response) {
            // If the request is successful, store the response in result_v
            result_v = response;
        },
        error: function(error) {
            // If there's an error, store the error message in result_v
            result_v = error;
        }
    });

    // Return the result
    return result_v;
}