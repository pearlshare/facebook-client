# facebook-client

A wrapper around the facebook graph API to make requests and handle responses.

NOTE: This is a work in progress.

## Objectives

Clean and easy to extend API to make requests to the facebook graph.

* Return simple objects
* Easy to extend functionality
* Promise based API

## Usage

```js
    var facebookClient = require("facebook-client");

    var facebook = facebookClient("123abc");

    // Get owner's profile details
    facebook.me().then(function(res) {
        console.log(res.body);
    });
```

## Documentation

Check `./lib` and `./test` for documentation in the code