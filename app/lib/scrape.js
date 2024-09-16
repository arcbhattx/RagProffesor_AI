// lib/scrape.js
import axios from 'axios';
import cheerio from 'cheerio';

export async function scrapeRateMyProfessor(link) {
  try {
    const { data } = await axios.get(link);
    console.log(data)
    const $ = cheerio.load(data);

    // Example selectors - **Adjust these based on the actual HTML structure**
    const professorName = $('h1.professor-name').text().trim();
    const subject = $('div.subject').text().trim();
    const starsText = $('span.rating').text().trim();
    const review = $('div.review-text').text().trim();

    // Extract numerical stars if possible
    const stars = parseFloat(starsText) || 0;

    return {
      professor: professorName || 'Unknown Professor',
      subject: subject || 'Unknown Subject',
      stars: stars,
      review: review || 'No review available.',
    };
  } catch (error) {
    console.error('Error scraping Rate My Professor:', error);
    throw new Error('Failed to scrape professor data.');
  }
}
