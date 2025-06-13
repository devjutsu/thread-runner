import { chromium } from 'playwright';
import chalk from 'chalk';

const SEARCH_URL = `https://www.threads.net/search?q=${encodeURIComponent('парабеллум')}&filter=recent`;

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 60 });
  const context = await browser.newContext({
    storageState: 'playwright/.auth/user.json',
  });

  const page = await context.newPage();
  await page.goto(SEARCH_URL);
  await page.waitForTimeout(3000);

  const seenUrls = new Set<string>();
  let totalPosts = 0;

  for (let scroll = 0; scroll < 6; scroll++) {
    await page.mouse.wheel(0, 3000);
    await page.waitForTimeout(1500);

    const containers = await page.locator('[data-pressable-container="true"]').elementHandles();

    for (const container of containers) {
      try {
        const fullText = (await container.innerText()).trim();

        const usernameSpan = await container.$('a[href*="/@"] >> span');
        const username = (await usernameSpan?.innerText())?.replace('@', '').trim() || 'unknown';

        const link = await container.$('a[href*="/@"]');
        const href = await link?.getAttribute('href');
        const postUrl = href ? `https://www.threads.net${href}` : '';

        if (!postUrl || seenUrls.has(postUrl)) continue;
        seenUrls.add(postUrl);

        const cleaned = fullText
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0 && !/translate/i.test(line))
          .join('\n');

        totalPosts++;
        console.log(`\n📦 Пост #${totalPosts}`);
        console.log(`👤 @${username}`);
        console.log(`🔗 ${postUrl}`);
        console.log(`📝 ${chalk.gray(cleaned)}`);
        console.log('─'.repeat(60));
      } catch (e) {}
    }
  }

  console.log(`\n📊 Всего уникальных постов собрано: ${totalPosts}`);

//   await browser.close();
})();
