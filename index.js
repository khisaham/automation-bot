require("dotenv").config();
const { chromium } = require("playwright-extra");
const stealth = require("puppeteer-extra-plugin-stealth");
const ExcelJS = require("exceljs");
const { applyForPerson } = require("./src/bot");
const { rand } = require("./src/human");

chromium.use(stealth());

const EXCEL_FILE = "./applicants.xlsx";
const SHEET_NAME = "Sheet1";

async function main() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(EXCEL_FILE);
  const sheet = workbook.getWorksheet(SHEET_NAME);

  // Map header row to column numbers
  const headers = {};
  sheet.getRow(1).eachCell((cell, col) => {
    headers[cell.value?.toString().trim().toLowerCase()] = col;
  });

  const appIdCol = headers["application id"] || sheet.columnCount + 1;

  // Set header for Application ID column if missing
  if (!headers["application id"]) {
    sheet.getRow(1).getCell(appIdCol).value = "Application ID";
  }

  const browser = await chromium.launch({ headless: false }); // headless:false so you can watch

  for (let rowNum = 2; rowNum <= sheet.rowCount; rowNum++) {
    const row = sheet.getRow(rowNum);
    const get = (col) =>
      row.getCell(headers[col])?.value?.toString().trim() || "";

    // Skip if already has an Application ID
    if (row.getCell(appIdCol).value) {
      console.log(`Row ${rowNum}: already processed, skipping.`);
      continue;
    }

    const person = {
      firstName: get("first name"),
      lastName: get("last name"),
      email: get("email"),
      phone: get("phone"),
      state: get("state"),
      zip: get("zip"),
      address: get("address"),
      courseLevel: get("course level"), // e.g. "undergraduate"
      course: get("course"), // e.g. "Computer Science"
      universityUrl: get("university url"), // e.g. "https://liber.edu/apply"
    };

    const context = await browser.newContext({
      viewport: { width: rand(1200, 1440), height: rand(700, 900) },
      locale: "en-US",
      timezoneId: "America/New_York",
    });
    const page = await context.newPage();

    try {
      const appId = await applyForPerson(page, person);

      // Write Application ID back to Excel immediately
      row.getCell(appIdCol).value = appId || "MANUAL_CHECK";
      await workbook.xlsx.writeFile(EXCEL_FILE);
      console.log(`Row ${rowNum}: saved.`);
    } catch (err) {
      console.error(`Row ${rowNum}: ERROR — ${err.message}`);
      row.getCell(appIdCol).value = `ERROR: ${err.message.slice(0, 60)}`;
      await workbook.xlsx.writeFile(EXCEL_FILE);
    } finally {
      await context.close();
      // Human-like pause between applicants (30–90 seconds)
      const pause = rand(30000, 90000);
      console.log(
        `  Waiting ${Math.round(pause / 1000)}s before next applicant...`,
      );
      await new Promise((r) => setTimeout(r, pause));
    }
  }

  await browser.close();
  console.log("\nAll done.");
}

main().catch(console.error);
