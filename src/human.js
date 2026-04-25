// Randomised delay between keystrokes (30–120ms like a real typist)
async function humanType(page, selector, text) {
  await page.click(selector);
  await page.waitForTimeout(rand(200, 500));
  for (const char of text) {
    await page.type(selector, char, { delay: rand(30, 120) });
    // Occasional longer pause mid-word (thinking pause)
    if (Math.random() < 0.05) await page.waitForTimeout(rand(300, 800));
  }
}

// Randomised mouse movement before clicking
async function humanClick(page, selector) {
  const el = await page.locator(selector).first();
  const box = await el.boundingBox();
  if (!box) return;
  // Move to a slightly random point within the element
  await page.mouse.move(
    box.x + box.width * (0.3 + Math.random() * 0.4),
    box.y + box.height * (0.3 + Math.random() * 0.4),
    { steps: rand(8, 20) },
  );
  await page.waitForTimeout(rand(80, 200));
  await page.mouse.click(
    box.x + box.width * (0.3 + Math.random() * 0.4),
    box.y + box.height * (0.3 + Math.random() * 0.4),
  );
}

// Random scroll to simulate reading the page
async function humanScroll(page) {
  const scrolls = rand(2, 5);
  for (let i = 0; i < scrolls; i++) {
    await page.mouse.wheel(0, rand(200, 500));
    await page.waitForTimeout(rand(400, 900));
  }
}

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

module.exports = { humanType, humanClick, humanScroll, rand };
