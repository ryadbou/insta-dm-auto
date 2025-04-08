const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  console.log("🟢 Lancement du navigateur pour login manuel...");

  const browser = await puppeteer.launch({
    headless: false,
    executablePath: "/Users/ryadb/.cache/puppeteer/chrome/mac_arm-131.0.6778.204/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: null
  });

  const page = await browser.newPage();
  await page.goto("https://www.instagram.com/", { waitUntil: "networkidle2" });

  console.log("🟡 Connecte-toi manuellement à Instagram.");
  console.log("👉 Clique sur « Not now » si Instagram te propose de sauvegarder la session.");
  console.log("✅ Quand tu as terminé, ferme la fenêtre du navigateur.");

  // Attente manuelle de la fermeture du navigateur
  await browser.waitForTarget(() => false).catch(() => {}); // attend indéfiniment

  try {
    const cookies = await page.cookies();
    fs.writeFileSync("cookies.json", JSON.stringify(cookies, null, 2));
    console.log("✅ Cookies sauvegardés avec succès !");
  } catch (err) {
    console.error("❌ Erreur lors de la sauvegarde des cookies :", err.message);
  }
})();