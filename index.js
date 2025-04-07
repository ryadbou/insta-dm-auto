const express = require("express");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");
const fs = require("fs");

console.log("✅ Serveur en cours de démarrage...");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

const chatId = {
  "ryad_immo_dubai": "17849593245253246"
};

app.post("/send-dm", async (req, res) => {
  const { username, message } = req.body;
  if (!username || !message) {
    return res.status(400).json({ error: "username and message are required" });
  }

  console.log("🟡 Lancement de Puppeteer...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // 🟢 CHARGEMENT DES COOKIES
    const cookiesPath = "cookies.json";
    if (fs.existsSync(cookiesPath)) {
      const cookies = JSON.parse(fs.readFileSync(cookiesPath));
      await page.setCookie(...cookies);
      console.log("🍪 Cookies chargés !");
    } else {
      console.log("⚠️ Aucun fichier de cookies trouvé.");
    }

    // Navigation vers Instagram
    console.log("🟡 Connexion Instagram...");
    const dmUrl = `https://www.instagram.com/direct/t/${chatId[username]}`;
    await page.goto(dmUrl, { waitUntil: "networkidle2" });

    console.log("🟡 Attente du champ...");
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
  res.send("✅ Instagram Auto-DM Server Ready");
});

app.listen(port, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${port}`);
});