var expect = require("expect.js");
var nock = require("nock");
var facebookClient = require("../");

var config = {
  enabled: false // Disabled for testing
};

describe("facebook-client", function () {

  describe("configuration", function () {
    it("should throw an error if no authToken is provided", function () {
      try {
        facebookClient().client();
      }
      catch (err) {
        console.log(err);
        expect(err).to.be.an(Error);
        expect(err.message).to.match(/authToken/);
      }
    });

    it("should initate wether or not a configuration object is given", function () {
      expect(facebookClient({enabled: false}).client("token")).to.be.an("object"); // With config
      expect(facebookClient().client("token")).to.be.an("object"); // Without config
    });
  });

  describe("makeRequest", function () {
    var facebook = facebookClient(config).client("token");

    it("should resolve to empty object if facebook not enabled", function () {
      config.enabled = false;

      return facebook.makeRequest("me").then(function (res) {
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
        .get("/" + facebook.apiVersion + "/test")
        .reply(200, mockResponse);

      return facebook.makeRequest("test").then(function (res) {
        expect(res.body).to.be.an("object");
        expect(res.body.id).to.eql(mockResponse.id);
        expect(res.body.first_name).to.eql(mockResponse.first_name);
        expect(res.body.last_name).to.eql(mockResponse.last_name);
        expect(res.body.email).to.eql(mockResponse.email);
      });
    });

    it("should handle a 400 error", function () {
      config.enabled = true;

      nock(facebook.url)
        .get("/" + facebook.apiVersion + "/test")
        .reply(400, {});

      return facebook.makeRequest("test").then(function (res) {
        expect(res.statusCode).to.equal(400);
        expect(res.body).to.be.an("object");
      });
    });
  });

  describe("me()", function () {
    var facebook = facebookClient(config).client("token");
    it("should make a request to get the user profile", function () {
      config.enabled = true;

      var mockResponse = {
        id: "1234567",
        name: "Homer Simpson"
      };

      nock(facebook.url)
        .get("/" + facebook.apiVersion + "/me")
        .reply(200, mockResponse);

      return facebook.me().then(function (res) {
        expect(res.body).to.be.an("object");
        expect(res.body.id).to.eql(mockResponse.id);
      });
    });

    it("should make a request to get the user profile with fields", function () {
      config.enabled = true;

      var mockResponse = {
        id: "1234567",
        "first_name": "Homer",
        "last_name": "Simpson",
        bio: "A user bio",
        email: "homer@example.com"
      };

      nock(facebook.url)
        .get("/" + facebook.apiVersion + "/me")
        .query({"fields": "first_name,last_name,email,bio"})
        .reply(200, mockResponse);

      return facebook.me(["first_name", "last_name", "email", "bio"]).then(function (res) {
        expect(res.body).to.be.an("object");
        expect(res.body.id).to.eql(mockResponse.id);
        expect(res.body.first_name).to.eql(mockResponse.first_name);
        expect(res.body.last_name).to.eql(mockResponse.last_name);
        expect(res.body.email).to.eql(mockResponse.email);
      });
    });
  });

  describe("friends()", function () {
    var facebook = facebookClient(config).client("token");

    it("should make a request to get the users friends", function () {
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
        .get("/" + facebook.apiVersion + "/me/friends")
        .reply(200, mockResponse);

      return facebook.friends().then(function (res) {
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

  describe("profilePhoto()", function () {
    var facebook = facebookClient(config).client("token");

    it("should make a request and get the URL of the users profile image", function () {
      config.enabled = true;

      var mockResponse = {
        "data": {
          "url": "https://example.com/someuser/profile.jpg"
        }
      };

      // Nock out facebook
      nock(facebook.url)
        .get("/" + facebook.apiVersion + "/me/picture?redirect=0")
        .reply(200, mockResponse);

      return facebook.profilePhoto().then(function (res) {
        expect(res.body).to.be.an("object");
        expect(res.body.data).to.be.an("object");
        expect(res.body.data.url).to.be.a("string");
        expect(res.body.data.url).to.eql(mockResponse.data.url);
      });
    });
  });

  describe("profilePhotoRedirectUrl()", function () {
    var facebook = facebookClient(config).client("token");

    it("should construct an redirect image url given userId", function () {
      config.enabled = true;

      var userId = 123;
      return facebook.profilePhotoRedirectUrl(userId).then(function (url) {
        expect(url).to.be.an("string");

        var re = new RegExp(userId, "g");
        expect(url).to.match(re);
      });
    });

    it("should construct an redirect image url by getting userId if not provided", function () {
      config.enabled = true;
      var mockResponse = {
        "data": {
          "name": "John Pasupula",
          "id": "123"
        }
      };
      nock(facebook.url)
        .get("/" + facebook.apiVersion + "/me")
        .reply(200, mockResponse);

      return facebook.profilePhotoRedirectUrl().then(function (url) {
        expect(url).to.be.an("string");

        var re = new RegExp(mockResponse.data.id, "g");
        expect(url).to.match(re);
      });
    });

    it("should null if failed to fetch userinfo and userId if not provided", function () {
      config.enabled = true;
      var mockResponse = {
        "data": {}
      };
      nock(facebook.url)
        .get("/" + facebook.apiVersion + "/me")
        .reply(200, mockResponse);

      return facebook.profilePhotoRedirectUrl().then(function (url) {
        expect(url).to.be.equal(null);
      });
    });
  });
});
