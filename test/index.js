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
        facebookClient().client();
      }
      catch (err) {
        expect(err).to.be.an(Error);
        expect(err.message).to.match(/authToken/);
      }
    });

    it("should initate wether or not a configuration object is given", function() {
      expect(facebookClient({enabled: false}).client("token")).to.be.an("object"); // With config
      expect(facebookClient().client("token")).to.be.an("object"); // Without config
    });
  });

  describe("makeRequest", function () {
    var facebook = facebookClient(config).client("token");

    it("should resolve to empty object if facebook not enabled", function () {
      config.enabled = false;

      return facebook.makeRequest("me").then(function(res) {
        expect(res).to.be.an("object");
        expect(Object.keys(res)).to.have.length(0);
      });
    });

    it("should make a request if facebook is enabled", function() {
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

      return facebook.makeRequest("test").then(function(res) {
        expect(res.body).to.be.an("object");
        expect(res.body.id).to.eql(mockResponse.id);
        expect(res.body.first_name).to.eql(mockResponse.first_name);
        expect(res.body.last_name).to.eql(mockResponse.last_name);
        expect(res.body.email).to.eql(mockResponse.email);
      });
    });

    it("should handle a 400 error", function() {
      config.enabled = true;

      nock(facebook.url)
        .get("/test")
        .reply(400, {});

      return facebook.makeRequest("test").then(function(res) {
        expect(res.statusCode).to.equal(400);
      });
    });
  });

  describe("me()", function() {
    var facebook = facebookClient(config).client("token");

    it("should make a request to get the user profile", function() {
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

      return facebook.me().then(function(res) {
        expect(res.body).to.be.an("object");
        expect(res.body.id).to.eql(mockResponse.id);
        expect(res.body.first_name).to.eql(mockResponse.first_name);
        expect(res.body.last_name).to.eql(mockResponse.last_name);
        expect(res.body.email).to.eql(mockResponse.email);
      });
    });
  });

  describe("friends()", function() {
    var facebook = facebookClient(config).client("token");

    it("should make a request to get the users friends", function() {
      config.enabled = true;

      var mockResponse = {
        "data": [
          {
            "name": "Homer Simpson",
            "id": "1234567"
          }
        ],
        "summary": {
          "total_count": 1
        }
      };

      // Nock out facebook messages
      nock(facebook.url)
        .get("/me/friends")
        .reply(200, mockResponse);

      return facebook.friends().then(function(res) {
        expect(res.body).to.be.an("object");
        expect(res.body.data).to.be.an("array");
        expect(res.body.data[0].name).to.eql(mockResponse.data[0].name);
        expect(res.body.data[0].id).to.eql(mockResponse.data[0].id);

        expect(res.body.summary).to.be.an("object");
        expect(res.body.summary.id).to.eql(mockResponse.summary.id);
        expect(res.body.summary.total_count).to.eql(mockResponse.summary.total_count);
      });
    });
  });
});
