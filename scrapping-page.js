const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function scrapeNewPage() {
  try {
    const url = 'https://news.ycombinator.com/'
    const response = await axios.get(url);
    const html = response.data;

    const $ = cheerio.load(html);
    const results = [];
    $('tr.athing').each((index, element) => {
      const title = $(element).find(' .titleline a').text().trim();
      const url = $(element).find('.titleline a').attr('href');
      const commentsText = $(element).next().find('.subtext a:contains("comments")').text().trim().split(' ')[0];
      const comments = parseInt(commentsText) || 0;
      results.push({ title, url, comments });
    }); 

    const groupedResults = {
      '0-100': [],
      '101-200': [],
      '201-300': [],
      '301-n': [],
    };

    results.forEach((result) => {
      if (result.comments >= 0 && result.comments <= 100) {
        groupedResults['0-100'].push(result);
      } else if (result.comments >= 101 && result.comments <= 200) {
        groupedResults['101-200'].push(result);
      } else if (result.comments >= 201 && result.comments <= 300) {
        groupedResults['201-300'].push(result);
      } else {
        groupedResults['301-n'].push(result);
      }
    });

    fs.writeFileSync('news_page_results.json', JSON.stringify(groupedResults, null, 2));

    console.log('Scraping and exporting completed.');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

scrapeNewPage();
