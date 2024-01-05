// 1. Import necessary modules
const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");
// 2. Initialize Express app
const app = express();
// 3. Define CORS Middleware
const corsMiddleware = (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://chat.openai.com");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
};
// 4. Apply CORS middleware to the app
app.use(corsMiddleware);
// 5. Define the logic for scraping content
const scrapeLogic = async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send("URL is required");
  }
  try {
    let htmlContent = await simpleHttpGet(url);
    let parsed = parseHtml(htmlContent);
    // Do data parsing here before returning.
    res.json({ htmlContent: parsed });
  } catch (error) {
    console.error(error);
    res.status(500).send(`Error processing request: ${error.message}`);
  }
};
// 6. Function to perform a simple HTTP GET request
async function simpleHttpGet(url) {
  const response = await axios.get(url);
  return response.data;
}
// 7. Function to parse HTML using Cheerio
function parseHtml(htmlContent) {
  const $ = cheerio.load(htmlContent);
  $('script, style, img, nav, footer').remove();
  let textContent = $('body').text();
  textContent = textContent.replace(/\n/g, ' ');
  return $("body").text().slice(0, 5000);
}
// 8. Setting up server routes
app.get("/scrape", (req, res) => {
  scrapeLogic(req, res);
});
app.get("/", (req, res) => {
  res.send("Hello world!");
});
// 9. Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
// 10. Export the scrape logic for external usage
module.exports = { scrapeLogic };
