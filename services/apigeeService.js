const axios = require("axios");
const apigeeService = {};
const qs = require("querystring");

var oauthCredentials = {
  key: process.env.APIGEE_KEY,
  secret: process.env.APIGEE_SECRET
},

basicString = "Basic " + base64;

apigeeService.getOauthToken = async function() {
  const baseHost = process.env.BASE_URL;
  const body = qs.stringify({ grant_type: "client_credentials" });
  const path = `${baseHost}/oauth/v1/token`;
  const authResponse = await axios.post(path, body, {
    headers: { Authorization: basicString },
  });
  const accessToken = authResponse.data["access_token"];

  return { baseHost, accessToken };
};

module.exports = apigeeService;
