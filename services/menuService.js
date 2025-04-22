const axios = require("axios");
const apigeeService = require("./apigeeService");
const menuService = {};

menuService.getPlacards = async function(cafeId) {
  try {
    const { baseHost, accessToken } = await apigeeService.getOauthToken();
    const url = baseHost + "/menu/" + cafeId + "/placards";
    const placardsResponse = await axios.get(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return placardsResponse.data;
  } catch (error) {
    console.error("Error in getPlacards: ", error);
    throw error;
  }
};

menuService.getCategories = async function (cafeId) {
  try {
    const { baseHost, accessToken } = await apigeeService.getOauthToken();
    const url = baseHost + "/menu/" + cafeId + "/categories";
    const categoriesResponse = await axios.get(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return categoriesResponse.data;
  } catch (error) {
    console.error("Error in getCategories: ", error);
    throw error;
  }
};

module.exports = menuService;
