const { humanType, humanClick, humanScroll, rand } = require("./human");
const { solveCaptcha } = require("./captcha");

async function applyForPerson(page, person) {
  console.log(`\n  Applying for: ${person.firstName} ${person.lastName}`);

  // 1. Navigate to university application page
  await page.goto(person.universityUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(rand(1000, 2000));
  await humanScroll(page);

  // 2. Select course level (undergraduate / diploma / master etc.)
  await humanClick(
    page,
    `[data-level="${person.courseLevel}"], option[value="${person.courseLevel}"]`,
  );
  await page.waitForTimeout(rand(800, 1500));

  // 3. Select specific course
  await humanClick(page, `option[value="${person.course}"]`);
  await page.waitForTimeout(rand(500, 1000));

  // 4. Fill personal details — type, never paste
  await humanType(
    page,
    '#firstName, input[name="first_name"]',
    person.firstName,
  );
  await humanType(page, '#lastName,  input[name="last_name"]', person.lastName);
  await humanType(page, '#email,     input[name="email"]', person.email);
  await humanType(page, '#phone,     input[name="phone"]', person.phone);
  await humanType(page, '#address,   input[name="address"]', person.address);
  await humanType(page, '#state,     input[name="state"]', person.state);
  await humanType(page, '#zip,       input[name="zip"]', person.zip);
  await page.waitForTimeout(rand(1000, 2000));

  // 5. Check for inline validation errors and correct them
  const errors = await page.$$(
    '.error-message, .field-error, [aria-invalid="true"]',
  );
  for (const errEl of errors) {
    const fieldId = await errEl.evaluate(
      (el) =>
        el.closest("[data-field]")?.dataset.field ||
        el.previousElementSibling?.getAttribute("for"),
    );
    if (fieldId && person[fieldId]) {
      console.log(`  Correcting field: ${fieldId}`);
      await page.fill(`#${fieldId}`, ""); // clear it
      await humanType(page, `#${fieldId}`, person[fieldId]);
    }
  }

  // 6. Solve CAPTCHA if present
  await solveCaptcha(page);

  // 7. Submit — human click on the submit button
  await humanClick(
    page,
    'button[type="submit"], input[type="submit"], .submit-btn',
  );
  await page.waitForNavigation({ waitUntil: "networkidle", timeout: 30000 });

  // 8. Extract application ID from confirmation page
  const bodyText = await page.textContent("body");
  const match = bodyText.match(
    /application\s*(id|number|ref)[:\s#]*([A-Z0-9\-]{4,20})/i,
  );
  const appId = match ? match[2] : null;

  if (appId) {
    console.log(`  Application ID: ${appId}`);
  } else {
    console.warn("  Could not extract Application ID — check page manually");
  }

  return appId;
}

module.exports = { applyForPerson };
