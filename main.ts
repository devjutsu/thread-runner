import { chromium } from 'playwright';
import chalk from 'chalk';

const SEARCH_URL = `https://www.threads.net/search?q=${encodeURIComponent('будем заниматься')}&filter=recent`;

const OPTIONAL_WORDS = ['хуйней', 'херней', 'фигней'];

function toLooseRegex(word: string): RegExp {
  const normalized = word.toLowerCase().replace(/ё/g, 'е');
  const pattern = normalized
    .split('')
    .map((ch) =>
      /[йуеиняеоа]/.test(ch)
        ? `[${ch}*]`
        : ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    )
    .join('');
  return new RegExp(pattern, 'i');
}

function highlightAll(text: string, patterns: RegExp[]): string {
  return patterns.reduce((result, regex) => {
    return result.replace(regex, (match) => chalk.bgYellow.black(match));
  }, text);
}

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 80 });
  const context = await browser.newContext({
    storageState: 'playwright/.auth/user.json',
  });

  const page = await context.newPage();
  await page.goto(SEARCH_URL);
  await page.waitForTimeout(3000);

  const seenUrls = new Set<string>();
  let totalMatched = 0;

  const optionalRegexes = OPTIONAL_WORDS.map(toLooseRegex);

  for (let scroll = 0; scroll < 1000; scroll++) {
    await page.mouse.wheel(0, 1500);
    await page.waitForTimeout(1000);

    const containers = await page
      .locator('[data-pressable-container="true"]')
      .elementHandles();

    for (const container of containers) {
      try {
        const fullText = (await container.innerText()).trim();

        const usernameSpan = await container.$('a[href*="/@"] >> span');
        const username =
          (await usernameSpan?.innerText())?.replace('@', '').trim() ||
          'unknown';

        const link = await container.$('a[href*="/@"]');
        const href = await link?.getAttribute('href');
        const postUrl = href ? `https://www.threads.net${href}` : '';

        if (!postUrl || seenUrls.has(postUrl)) continue;
        seenUrls.add(postUrl);

        const cleaned = fullText
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.length > 0 && !/translate/i.test(line))
          .join('\n');

        const normalized = cleaned.toLowerCase().replace(/ё/g, 'е');

        const hasBudem = /будем/i.test(normalized);
        const hasZanimatsya = /заниматься/i.test(normalized);
        const hasOptional = optionalRegexes.some((r) => r.test(normalized));

        // отладка
        if (!hasBudem || !hasZanimatsya || !hasOptional) {
          console.log(`\n🧬 ТЕКСТ:\n${chalk.gray(cleaned)}`);
        }

        if (hasBudem && hasZanimatsya && hasOptional) {
          totalMatched++;
          console.log(`\n✅ #${totalMatched}:`);
          console.log(`👤 @${username}`);
          console.log(`🔗 ${postUrl}`);
          console.log(`📝 ${highlightAll(cleaned, [...optionalRegexes])}`);
          console.log('─'.repeat(60));
        }

        console.log(
          `⇒ будем: ${hasBudem ? chalk.green('✓') : chalk.red('✗')}, заниматься: ${hasZanimatsya ? chalk.green('✓') : chalk.red('✗')}, херней: ${hasOptional ? chalk.green('✓') : chalk.red('✗')}`
        );
      } catch (e) {}
    }
  }

  if (totalMatched === 0) {
    console.log(`\n🚫 Ничего не найдено.`);
  } else {
    console.log(`\n🎯 Найдено ${totalMatched} постов.`);
  }

  //   await browser.close();
})();
