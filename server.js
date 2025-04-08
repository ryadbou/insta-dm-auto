const express = require("express");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");
const fs = require("fs");

console.log("✅ Serveur en cours de démarrage...");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post("/send-dm", async (req, res) => {
  const { username, message } = req.body;
  if (!username || !message) {
    return res.status(400).json({ error: "username and message are required" });
  }

  console.log(`📨 Envoi d’un message à @${username}`);

  const browser = await puppeteer.launch({
    headless: false, // 👀 Mode visuel pour déboguer
    slowMo: 100, // ⏱️ Ralenti les actions (en ms)
    executablePath: "/Users/ryadb/.cache/puppeteer/chrome/mac_arm-131.0.6778.204/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // 🟢 Chargement des cookies
    const cookiesPath = "cookies.json";
    if (fs.existsSync(cookiesPath)) {
      const cookies = JSON.parse(fs.readFileSync(cookiesPath));
      await page.setCookie(...cookies);
      console.log("🍪 Cookies chargés !");
    } else {
      console.log("⚠️ Aucun fichier cookies trouvé.");
    }

    // Navigation vers le profil
    const profileUrl = `https://www.instagram.com/${username}/`;
    console.log(`🌍 Navigation vers ${profileUrl}`);
    await page.goto(profileUrl, { waitUntil: "networkidle2", timeout: 30000 });

    // Clic sur le bouton Message
    console.log("🔍 Recherche du bouton Message...");
    await page.waitForSelector('text/Message', { timeout: 10000 });
    await page.click('text/Message');

    // Attente du champ de texte
    console.log("⌨️ Attente du champ de texte...");
    await page.waitForSelector('div[role="textbox"]', { timeout: 10000 });
    await page.type('div[role="textbox"]', message);
    await page.keyboard.press("Enter");

    console.log("✅ Message envoyé !");
    await browser.close();
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Erreur :", err.message);
    await browser.close();
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("✅ Serveur prêt à envoyer des messages.");
});

app.listen(port, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${port}`);
});