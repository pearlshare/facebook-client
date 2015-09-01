var got = require("got");
var Bluebird = require("bluebird");

var graphUrl = "https://graph.facebook.com/v2.1";

/**
 * A helper library for making requests to facebook's graph API
 * @param {String} authToken  token provided by users to access resources
 * @param {Object} config     facebook-client configuration object
 * @returns {Object} facebook request helper
 */
module.exports = function facebookClient(authToken, config) {
  /**
   * Build the full URL based on the path given
   * @param {String} path  the path to be added to the full URL
   * @returns {String} the full path needed for the request
   */
  function buildUrl(path) {
    return graphUrl + "/" + path;
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

  return {
    buildUrl: buildUrl,
    makeRequest: makeRequest,
    me: me,
    friends: friends,
    url: graphUrl
  };
};
