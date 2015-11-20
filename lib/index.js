var got = require("got");
var Bluebird = require("bluebird");

var graphUrl = "https://graph.facebook.com/v2.1";

/**
 * A helper library for making requests to facebook's graph API
 * @param {Object} config     facebook-client configuration object
 * @returns {Object} facebook request helper
 */
module.exports = function facebookClient(config) {
  /**
   * Build the full URL based on the path given
   * @param {String} path  the path to be added to the full URL
   * @returns {String} the full path needed for the request
   */
  function buildUrl(path) {
    return graphUrl + "/" + path;
  }

  /**
   * Accept auth token to make requests using
   * @param {String} authToken  token provided by users to access resources
   * @returns {Object} helper for use with autToken
   */
  function client(authToken) {
    if (!authToken) {
      throw new Error("An authToken is required to initate client");
    }

    /**
     * Make requests to the facebook graph API
     * https://developers.facebook.com/docs/graph-api/reference
     * @param {String}  path          path to the resource to access
     * @returns {Promise} promise resolving to network response
     */
    function makeRequest(path) {
      var url = buildUrl(path);
      if (config.enabled) {
        return got(url, {
          method: "get",
          headers: {
            "Authorization": "Bearer " + authToken,
            "Accept": "application/json"
          }
        }).catch(function(err) {
          if (err.statusCode && err.statusCode >= 400) {
            return err.response;
          }
          else {
            throw err;
          }
        }).then(function(res) {
          res.origBody = res.body;
          res.body = JSON.parse(res.body);
          return res;
        });
      } else {
        return Bluebird.resolve({});
      }
    }

    /**
     * Provide an interface for retriving the uers information
     * @returns {Promise} a promise providing the users information
     */
    function me() {
      return makeRequest("me");
    }

    /**
     * Provide an interface for retriving the uers information
     * @returns {Promise} a promise providing the users friends
     */
    function friends() {
      return makeRequest("me/friends");
    }

    /**
     * Prove an interface to access the users profile photo
     * @returns {Promise} a promise providing the URL of the users profile image
     */
     function profilePhoto() {
      return makeRequest("me/picture?redirect=0");
     }

    return {
      makeRequest: makeRequest,
      me: me,
      friends: friends,
      profilePhoto: profilePhoto,
      url: graphUrl
    };
  }

  return {
    buildUrl: buildUrl,
    client: client,
    url: graphUrl
  };
};
