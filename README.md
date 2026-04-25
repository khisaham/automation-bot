# 🎓 College Application RPA Bot

> A Node.js Robotic Process Automation bot that fills and submits college applications in bulk — reading applicant data from Excel, typing like a human, handling CAPTCHAs, and writing Application IDs back to the spreadsheet automatically.

---

## 📌 Table of Contents

- [What It Is](#what-it-is)
- [Why It's Needed](#why-its-needed)
- [How It Mimics a Human](#how-it-mimics-a-human)
- [End-to-End Workflow](#end-to-end-workflow)
- [Project Structure](#project-structure)
- [Excel Spreadsheet Format](#excel-spreadsheet-format)
- [Tech Stack](#tech-stack)
- [Installation & Usage](#installation--usage)
- [Selector Customisation](#selector-customisation)
- [Practical Notes](#practical-notes)

---

## What It Is

A **Robotic Process Automation (RPA) bot** built with Node.js that acts as a digital assistant for processing college applications in bulk. It reads applicant data from an Excel spreadsheet, opens a real Chromium browser, navigates to university application portals, fills out every form field exactly as a human would (character by character), handles errors and CAPTCHAs, submits the application, captures the resulting Application ID, and writes it back into the spreadsheet — then moves on to the next person automatically.

---

## Why It's Needed

Manually applying to college on behalf of dozens or hundreds of students is:

- **Extremely time-consuming** — 30–60 minutes per application
- **Prone to human copy-paste errors** — wrong fields, missed inputs
- **Inconsistent** — different staff members fill forms differently
- **Impossible to scale** — you'd need a large team for bulk submissions

This bot reduces each application to a supervised, automated process that is consistent, auditable, resumable, and fully scalable.

---

## How It Mimics a Human

This is the most critical design goal. University portals increasingly use bot-detection systems. The bot mimics human behaviour in the following ways:

### Typing Behaviour
Instead of pasting text instantly (which no human does), it types each character individually with a randomised delay of **30–120ms per keystroke**, occasionally pausing mid-field to simulate thinking, with longer pauses at the end of words.

### Mouse Behaviour
Before clicking any button or field, the mouse moves to a slightly randomised point within the element across multiple steps — not teleporting — then dwells briefly before clicking, exactly like a real person moving their cursor.

### Scrolling
After page load, the bot scrolls the page randomly 2–5 times at varying speeds to simulate reading before it begins typing.

### Timing Between Actions
Every action (click, type, navigate) has a randomised wait before the next one. Between applicants, the bot pauses **30–90 seconds** to avoid triggering rate limits.

### Browser Fingerprint Spoofing
The `playwright-extra` stealth plugin patches over **20 browser APIs** that websites use to detect automation:
- `navigator.webdriver`
- `window.chrome`
- Canvas fingerprint
- WebGL renderer string
- Plugin list and MIME types
- And many more

### Randomised Viewport
Each applicant gets a slightly different browser window size (1200–1440px wide, 700–900px tall) to avoid a uniform, detectable fingerprint.

---

## End-to-End Workflow

Here is every step the bot performs for each row in the spreadsheet:

| Step | Action | Detail |
|------|--------|--------|
| 1 | **Read applicant row** | Reads all fields from Excel. Skips rows that already have an Application ID. |
| 2 | **Launch fresh browser context** | New isolated session per applicant — no cookies carry over. |
| 3 | **Navigate to university portal** | Goes to the application URL, waits for JS to render, then scrolls to simulate reading. |
| 4 | **Select course type** | Clicks undergraduate / diploma / certificate / master with humanised mouse movement. |
| 5 | **Fill all form fields** | Types every field character by character — never pastes. |
| 6 | **Detect & fix validation errors** | Scans for red borders, error text, `aria-invalid` attributes. Clears and re-types wrong fields. |
| 7 | **Solve CAPTCHA if present** | Sends reCAPTCHA / hCaptcha to 2Captcha cloud service, injects returned token. |
| 8 | **Submit application** | Humanised click on the submit button, waits for confirmation page to load. |
| 9 | **Capture Application ID** | Reads confirmation page using regex or CSS selector to extract the reference number. |
| 10 | **Write back to Excel** | Immediately saves the Application ID to the correct row and writes file to disk. |
| 11 | **Pause and repeat** | Waits 30–90 seconds, closes context, moves to next applicant. |

---

## Project Structure

```
college-bot/
├── .env                    ← API keys (never commit to Git)
├── index.js                ← Entry point — reads Excel, loops over applicants
├── applicants.xlsx         ← Your data spreadsheet
└── src/
    ├── bot.js              ← Form-filling logic (customise selectors per university)
    ├── human.js            ← Typing, clicking, scrolling helper functions
    └── captcha.js          ← 2Captcha API integration
```

---

## Excel Spreadsheet Format

Your spreadsheet must have these columns in the header row (Row 1):

| First Name | Last Name | Email | Phone | Address | State | Zip | Course Level | Course | University URL | Application ID |
|------------|-----------|-------|-------|---------|-------|-----|--------------|--------|----------------|----------------|
| Jane | Doe | jane@email.com | 5551234567 | 123 Main St | Texas | 75001 | undergraduate | Computer Science | https://apply.liber.edu | *(auto-filled)* |
| John | Smith | john@email.com | 5559876543 | 456 Oak Ave | Florida | 33101 | master | Business Admin | https://apply.liber.edu | *(auto-filled)* |

**Course Level values:** `undergraduate`, `diploma`, `certificate`, `master`, `phd`

The bot reads every row top to bottom, fills the **Application ID** column automatically, and **skips rows that already have one** — making it safe to stop and re-run.

---

## Tech Stack

| Role | Package | Why |
|------|---------|-----|
| Browser automation | `playwright-extra` | Most powerful Node.js automation library, native async/await |
| Bot detection bypass | `puppeteer-extra-plugin-stealth` | Patches 20+ browser fingerprint detection vectors |
| CAPTCHA solving | `2captcha-ts` | Cloud API supporting reCAPTCHA v2/v3, hCaptcha, image CAPTCHAs |
| Excel read/write | `exceljs` | Full read + write support with cell-level control |
| Config & secrets | `dotenv` | Keeps API keys out of source code |

---

## Installation & Usage

### 1. Install dependencies

```bash
npm install playwright-extra puppeteer-extra-plugin-stealth exceljs 2captcha-ts dotenv
npx playwright install chromium
```

### 2. Create your `.env` file

```env
CAPTCHA_API_KEY=your_2captcha_api_key_here
```

> Get your API key from [2captcha.com](https://2captcha.com). Top up balance before running bulk jobs.

### 3. Prepare your spreadsheet

Fill in `applicants.xlsx` with your applicant data following the [format above](#excel-spreadsheet-format). Leave the **Application ID** column empty — the bot fills it.

### 4. Run the bot

```bash
# Recommended: watch it work on the first few rows
node index.js
```

> Set `headless: false` in `index.js` to watch the browser fill forms in real time. Switch to `headless: true` for unattended bulk runs once you've verified selectors are correct.

---

## Selector Customisation

Every university website uses different HTML field names. Before running in bulk, you must configure the selectors in `src/bot.js` for each target university.

### How to find selectors

1. Open the university application form in Chrome
2. Press **F12** to open DevTools
3. Click the **Inspector** (cursor icon) and click each form field
4. Note the `id`, `name`, or a unique CSS selector for each field
5. Update `src/bot.js` with those selectors

### Example selector map

```js
// src/selectors/liber-edu.js
module.exports = {
  firstName:   '#firstName',
  lastName:    '#lastName',
  email:       'input[name="email"]',
  phone:       'input[name="phone_number"]',
  state:       'select#state',
  zip:         'input[placeholder="ZIP Code"]',
  courseLevel: 'select[name="program_level"]',
  course:      'select[name="program_name"]',
  submitBtn:   'button.apply-submit',
  appIdEl:     '.confirmation-number', // element containing the Application ID
};
```

This is a **one-time setup per university**. Once configured, the bot handles all applicants for that portal automatically.

---

## Practical Notes

### Resume-safe
Because the bot skips rows that already have an Application ID, you can **stop at any time and re-run** from where it left off. Progress is never lost.

### Error handling
Any row that fails gets `ERROR: <reason>` written into the Application ID column so you can review and manually fix those specific cases without re-running successful ones.

### Rate limiting
The 30–90 second pause between applicants is intentional. Submitting too fast will get your IP flagged by the university's server. If applying to the same university for many students, consider spacing runs across multiple hours or days, or use rotating residential proxies.

### Proxy support
For large batches, add a rotating proxy via:
```js
await chromium.launch({
  proxy: { server: 'http://your-proxy-host:port' }
});
```
Providers: Brightdata, Oxylabs, Smartproxy.

### Logs
The bot logs every step to the console with row number, applicant name, Application ID captured, and any errors — giving you a full audit trail of each run.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CAPTCHA_API_KEY` | Yes | Your 2Captcha API key for solving CAPTCHAs |

---

## License

MIT — use freely, modify as needed.

---

> **Built with:** Node.js · Playwright · ExcelJS · 2Captcha