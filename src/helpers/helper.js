async function fillInput(page, labelText, value) {
  const input = page
    .locator(`label:has-text("${labelText}")`)
    .locator("..")
    .locator("input");
  await input.waitFor({ timeout: 0 });
  await input.fill(value);
}

async function fillByPlaceholder(page, placeholder, value) {
  const input = page.locator(`input[placeholder*="${placeholder}"]`);
  await input.waitFor({ timeout: 0 });
  await input.fill(value);
}

async function clickNext(page) {
  const btn = page.locator('button:has-text("Next")');
  await btn.waitFor({ timeout: 0 });
  await btn.click();
}

async function clickSubmit(page) {
  const btn = page.locator('button:has-text("Submit")');
  await btn.waitFor({ timeout: 0 });
  await btn.click();
}
