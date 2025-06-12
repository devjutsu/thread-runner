import { chromium } from 'playwright';

const KEYWORD = 'заниматься херней';

async function searchThreads() {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const context = await browser.newContext({
    storageState: 'playwright/.auth/user.json',
  });

  const page = await context.newPage();
  await page.goto('https://www.threads.net/');

  await page.waitForTimeout(5000);

  // Скроллим вниз, чтобы подгрузились посты
  for (let i = 0; i < 5; i++) {
    await page.mouse.wheel(0, 3000);
    await page.waitForTimeout(1500);
  }

  const articles = await page.locator('article').allTextContents();

  console.log(`\n🔍 Ищем "${KEYWORD}" в ${articles.length} постах:\n`);

  for (const post of articles) {
    if (post.toLowerCase().includes(KEYWORD.toLowerCase())) {
      console.log('🧵 Найдено:\n', post.trim());
      console.log('─'.repeat(40));
    }
  }

  await browser.close();
}

searchThreads();
