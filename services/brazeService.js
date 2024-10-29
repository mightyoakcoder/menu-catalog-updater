const axios = require("axios");
const menuService = require("./menuService");
const brazeService = {};

const brazeApiKey = process.env.APP_BRAZE_API_KEY;

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${brazeApiKey}`,
};

const buildMenu = async function() {
  try {
    const cafeId = 500000;
    
    const categoriesData = await menuService.getCategories(cafeId);
    const { categories } = categoriesData;

    const catMap = {};
    for (const cat of categories) {
      if (cat.placards) {
        for (const plc of cat.placards) {
          catMap[plc] = catMap[plc] || [];
          catMap[plc].push(cat.i18nNameVal);
        }
      }

      if (cat.catOrder) {
        for (var iCat of cat.catOrder) {
          var matchingCategory = categories.find((c) => c.catId == iCat);
          if (matchingCategory && matchingCategory.placards) {
            for (var plc of matchingCategory.placards) {
              catMap[plc] = catMap[plc] || [];
              catMap[plc].push(cat.i18nNameVal);
            }
          }
        }
      }
    }

    const placardsData = await menuService.getPlacards(cafeId);
    const { placards } = placardsData;

    const productList = [];

    const usedItemIds = new Set();

    for (const plc of placards) {
      for (const optSet of plc.optSets || []) {
        
        const imageBaseUrl =
          "https://www.panerabread.com/content/dam/panerabread/menu-omni/integrated-web/detail/";
        const imageUrl = `${imageBaseUrl}${optSet.imgKey}.jpg.transform/braze-menu/image.20240118.jpg`;

        var item = {
          id: optSet.itemId.toString(),
          itemId: optSet.itemId,
          name: optSet.i18nNameVal,
          logicalName: optSet.logicalName,
          imageUrl: imageUrl,
          price: optSet.price,
          isCustomizable: optSet.isCustomizable,
          portion: optSet.portion,
          menuItemType: optSet.menuItemType,
          itemContext: optSet.itemContext,
          allergens: [],
          wellnessPreferences: [],
          categories: [],
        };

        if (optSet.allergens) {
          for (const allergenGroup of optSet.allergens) {
            for (const subGroup of Object.keys(allergenGroup)) {
              for (const allergen of allergenGroup[subGroup]) {
                item.allergens.push(allergen.i18nNameVal);
              }
            }
          }
        }

        if (optSet.wellness) {
          item.wellnessPreferences = optSet.wellness.map(
            (wellnessItem) => wellnessItem.name
          );
        }

        if (optSet.nutr) {
          const calorieData = optSet.nutr
            .filter((nutritionalData) => nutritionalData.unit == "Cal")
            .map((nutritionalData) => nutritionalData.value);
          item.calories = calorieData.reduce((a, b) => a + b, 0);

          const proteinData = optSet.nutr
            .filter((nutritionalData) => nutritionalData.nutrient == "Protein")
            .map((nutritionalData) => nutritionalData.value);
          item.protein = proteinData.reduce((a, b) => a + b, 0);
        }

        if (catMap[plc.plcId]) {
          const allCategories = catMap[plc.plcId];
          const categories = [...new Set(allCategories)];
          item.categories = categories;
        }

        if (optSet.price) {
          item.price = optSet.price;
        }

        if (usedItemIds.has(item.itemId)) {
          console.log(`Skipping duplicate itemId: ${item.itemId}`);
          continue;
        }

        usedItemIds.add(item.itemId);

        productList.push(item);
      }
    }
    
    const batchSize = 50;
    const totalBatches = Math.ceil(productList.length / batchSize);

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const startIdx = batchIndex * batchSize;
      const endIdx = startIdx + batchSize;
      const batchItems = productList.slice(startIdx, endIdx);
      
      const apiUrl = `https://rest.iad-05.braze.com/catalogs/Menu/items`;

      await axios.put(apiUrl, { items: batchItems }, { headers });
      console.log("Batch", batchIndex + 1, "of", totalBatches, "completed.");
      if (batchIndex < totalBatches - 1) {
        console.log("Cooling down before next batch.");
        await new Promise((resolve) => setTimeout(resolve, 60000));
      }
    }

  } catch (error) {
    console.error("Axios Error: ", error);

    if (error.response && error.response.data) {
      const { data } = error.response;
      console.error("Braze API Error:", data.message);
      console.error("Errors:", data.errors);
    }
  }
};

module.exports = { buildMenu };
