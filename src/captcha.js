const { Solver } = require("2captcha-ts");
const solver = new Solver(process.env.CAPTCHA_API_KEY);

async function solveCaptcha(page) {
  // Check for reCAPTCHA
  const sitekey = await page.evaluate(() => {
    const el = document.querySelector("[data-sitekey]");
    return el ? el.getAttribute("data-sitekey") : null;
  });
  if (!sitekey) return; // No CAPTCHA found

  console.log("  CAPTCHA detected, solving...");
  const { data: token } = await solver.recaptcha({
    googlekey: sitekey,
    pageurl: page.url(),
  });

  // Inject the token into the page
  await page.evaluate((t) => {
    document.querySelector("#g-recaptcha-response").value = t;
    // Trigger any onsubmit callbacks
    if (window.___grecaptcha_cfg) {
      const id = Object.keys(window.___grecaptcha_cfg.clients)[0];
      window.___grecaptcha_cfg.clients[id].aa.aa.callback(t);
    }
  }, token);

  console.log("  CAPTCHA solved.");
}

module.exports = { solveCaptcha };
