const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function scrapeHackerNews() {
  try {
    // Fetch HTML content from the Hacker News page
    const response = await axios.get('https://news.ycombinator.com/');
    const html = response.data;
    // console.log(response)
    // Load HTML content into Cheerio for easier manipulation
    const $ = cheerio.load(html);
    // Extract information from each news item
    const results = [];
    $('tr.athing').each((index, element) => {
      const title = $(element).find(' .titleline a').text().trim();
      const url = $(element).find('.titleline a').attr('href');
      const commentsText = $(element).next().find('.subtext a:contains("comments")').text().trim().split(' ')[0];
      const comments = parseInt(commentsText) || 0;

      results.push({ title, url, comments });
    }); 
    console.log("result", results)

    // Group results based on comment ranges
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

    // Export results as JSON
    fs.writeFileSync('hacker_news_results.json', JSON.stringify(groupedResults, null, 2));

    // Export results as CSV (optional)
    const csvContent = results.map(result => `${result.title},${result.url},${result.comments}`).join('\n');
    fs.writeFileSync('hacker_news_results.csv', `Title,URL,Comments\n${csvContent}`);

    console.log('Scraping and exporting completed.');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the scraping function
scrapeHackerNews();
