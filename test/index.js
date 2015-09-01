var expect = require("expect.js");
var nock = require("nock");
var facebookClient = require("../");

var config = {
  enabled: false // Disabled for testing
};

describe("facebook-client", function() {

  describe("configuration", function() {
    it("should throw an error if no authToken is provided", function() {
      try {
        facebookClient();
      }
      catch (err) {
        expect(err).to.be.an(Error);
        expect(err.message).to.match(/authToken/);
      }
    });

    it("should initate wether or not a configuration object is given", function() {
      expect(facebookClient("token", {enabled: false})).to.be.an("object"); // With config
      expect(facebookClient("token")).to.be.an("object"); // Without config
    });
  });

  describe("makeRequest", function () {
    var facebook = facebookClient("token", config);

    it("should resolve to empty object if facebook not enabled", function () {
      config.enabled = false;

      facebook.makeRequest("token", "me").then(function(res) {
        expect(res).to.be.an("object");
        expect(Object.keys(res)).to.have.length(0);
      });
    });

    it("should make a request if facebook is enabled", function () {
      config.enabled = true;

      var mockResponse = {
        id: "1234567",
        "first_name": "Homer",
        "last_name": "Simpson",
        bio: "A user bio",
        email: "homer@example.com"
      };

      // Nock out facebook messages
      nock(facebook.url)
        .get("/test")
        .reply(200, mockResponse);

      facebook.makeRequest("test").then(function(res) {
        expect(res).to.be.an("object");
        expect(res.body.email).to.eql(mockResponse.email);
        expect(res.body.first_name).to.eql(mockResponse.first_name);
        expect(res.body.last_name).to.eql(mockResponse.last_name);
        expect(res.body.email).to.eql(mockResponse.email);
      });
    });
  });

  describe("me()", function () {
    var facebook = facebookClient("token", config);

    it("should make a request to get the user profile", function () {
      config.enabled = true;

      var mockResponse = {
        id: "1234567",
        "first_name": "Homer",
        "last_name": "Simpson",
        bio: "A user bio",
        email: "homer@example.com"
      };

      // Nock out facebook messages
      nock(facebook.url)
        .get("/me")
        .reply(200, mockResponse);

      facebook.me().then(function(res) {
        expect(res).to.be.an("object");
        expect(res.body.email).to.eql(mockResponse.email);
        expect(res.body.first_name).to.eql(mockResponse.first_name);
        expect(res.body.last_name).to.eql(mockResponse.last_name);
        expect(res.body.email).to.eql(mockResponse.email);
      });
    });
  });
});
