async function applyForPerson(page, person) {
  console.log(`\n  Applying for: ${person.firstName} ${person.lastName}`);

  // 1. Navigate to university application page
  console.log("  Navigating to application page...");

  await page.goto(person.universityUrl, {
    waitUntil: "domcontentloaded",
    timeout: 0,
  });


 const appId = 'Not implemented yet'; // Placeholder for application ID extraction logic

  if (appId) {
    console.log(`  Application ID: ${appId}`);
  } else {
    console.warn("  Could not extract Application ID — check page manually");
  }

  return appId;
}

module.exports = { applyForPerson };
