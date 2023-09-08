const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
const port = 3000;

app.get("/api/getinfo", async (req, res) => {
  try {
    const htmlResponse = await axios.get("https://time.com");

    const $ = cheerio.load(htmlResponse.data);

    const lateststories = $("div.partial.latest-stories > ul > li")
      .map((index, element) => {
        const headingText = $(element).text();
        const link = $(element).find("a").attr("href");

        return {
          title: headingText,
          link: "https://time.com" + link,

        };
      })
      .get();

    res.json(lateststories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});