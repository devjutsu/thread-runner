"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const playwright_1 = require("playwright");
const chalk_1 = __importDefault(require("chalk"));
const KEYWORD = 'заниматься хернёй';
const SEARCH_URL = `https://www.threads.net/search?q=${encodeURIComponent(KEYWORD)}`;
const highlight = (text, keyword) => {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'gi');
    return text.replace(regex, match => chalk_1.default.bgYellow.black(match));
};
(async () => {
    const browser = await playwright_1.chromium.launch({ headless: true, slowMo: 100 });
    const context = await browser.newContext({
        storageState: 'playwright/.auth/user.json',
    });
    const page = await context.newPage();
    await page.goto(SEARCH_URL);
    await page.waitForTimeout(4000);
    // Scroll down to load more posts
    for (let i = 0; i < 6; i++) {
        await page.mouse.wheel(0, 3000);
        await page.waitForTimeout(1500);
    }
    const containers = await page.locator('[data-pressable-container="true"]').elementHandles();
    const posts = [];
    console.log(`🔍 Found ${containers.length} potential post containers`);
    for (const [i, container] of containers.entries()) {
        try {
            const textSpans = await container.$$('span[dir="auto"]');
            const text = (await Promise.all(textSpans.map(span => span.innerText())))
                .join(' ')
                .trim();
            const usernameSpan = await container.$('a[href*="/@"] >> span');
            const username = (await usernameSpan?.innerText())?.replace('@', '').trim() || 'unknown';
            const link = await container.$('a[href*="/@"]');
            const href = await link?.getAttribute('href');
            const postUrl = href ? `https://www.threads.net${href}` : '';
            if (text.toLowerCase().includes(KEYWORD.toLowerCase()) && postUrl) {
                posts.push({ url: postUrl, username, text });
                console.log(`\n✅ Post #${posts.length} found:`);
                console.log(`👤 @${username}`);
                console.log(`🔗 ${postUrl}`);
                console.log(`📝 ${highlight(text, KEYWORD)}`);
                console.log('─'.repeat(60));
            }
        }
        catch (e) {
            console.log(`⚠️ Error parsing post #${i + 1}:`, e);
        }
    }
    // Remove duplicate posts by URL
    const uniquePosts = Array.from(new Map(posts.map(p => [p.url, p])).values());
    if (uniquePosts.length === 0) {
        console.log(`\n🚫 No posts found containing "${KEYWORD}".`);
    }
    else {
        console.log(`\n🎯 Found ${uniquePosts.length} unique posts for keyword "${chalk_1.default.yellow(KEYWORD)}".`);
    }
    await browser.close();
})();
//# sourceMappingURL=main.js.map