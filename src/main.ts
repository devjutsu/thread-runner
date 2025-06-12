import { chromium, Browser, Page } from 'playwright';
import dotenv from 'dotenv';
import winston from 'winston';

dotenv.config();

// Configure logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

const KEYWORD = process.env.SEARCH_KEYWORD || 'заниматься херней';

async function searchThreads() {
  let browser: Browser | null = null;
  
  try {
    logger.info(`Starting search for keyword: "${KEYWORD}"`);
    
    browser = await chromium.launch({ 
      headless: process.env.HEADLESS !== 'false',
      slowMo: Number(process.env.SLOW_MO) || 100 
    });
    
    const context = await browser.newContext({
      storageState: 'playwright/.auth/user.json',
    });

    const page = await context.newPage();
    await page.goto('https://www.threads.net/');
    logger.info('Navigated to Threads.net');

    await page.waitForTimeout(5000);

    // Scroll to load more posts
    const scrollCount = Number(process.env.SCROLL_COUNT) || 5;
    logger.info(`Scrolling ${scrollCount} times to load more posts`);
    
    for (let i = 0; i < scrollCount; i++) {
      await page.mouse.wheel(0, 3000);
      await page.waitForTimeout(1500);
    }

    const articles = await page.locator('article').allTextContents();
    logger.info(`Found ${articles.length} posts to analyze`);

    const matches = articles.filter(post => 
      post.toLowerCase().includes(KEYWORD.toLowerCase())
    );

    if (matches.length > 0) {
      logger.info(`Found ${matches.length} matching posts:`);
      matches.forEach((post, index) => {
        logger.info(`\nMatch ${index + 1}:\n${post.trim()}\n${'─'.repeat(40)}`);
      });
    } else {
      logger.info('No matching posts found');
    }

  } catch (error) {
    logger.error('Error during search:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
      logger.info('Browser closed');
    }
  }
}

// Run the search
searchThreads().catch(error => {
  logger.error('Fatal error:', error);
  process.exit(1);
}); 