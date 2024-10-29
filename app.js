require('dotenv').config();

const { buildMenu } = require("./services/brazeService");

async function runProcess() {
  console.log("Beginning menu catalog build process.")
  await buildMenu();
  console.log("Finished menu catalog build process.")
}

runProcess();