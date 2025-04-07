const puppeteer = require('puppeteer');
const fs = require('fs');

const chatId = {
  "ryad_immo_dubai": "17849593245253246"
};

const username = "ryad_immo_dubai";
const message = "Hello 👋 Ceci est un message automatique !";

(async () => {
  console.log("🟡 Lancement de Puppeteer...");
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  console.log("🟡 Chargement des cookies...");
  const cookies = JSON.parse(fs.readFileSync('./cookies.json', 'utf-8'));
  await page.setCookie(...cookies);

  console.log("🟡 Navigation vers Instagram...");
  const dmUrl = `https://www.instagram.com/direct/t/${chatId[username]}`;
  console.log(`➡️ Navigation vers ${dmUrl}`);
  await page.goto(dmUrl, { waitUntil: 'networkidle2' });

  // 🔧 Fermer le popup "Turn on Notifications"
  console.log("🟡 Fermeture du popup 'Turn on Notifications' s'il est présent...");
  try {
    await page.waitForSelector('div[role="dialog"] button', { timeout: 3000 });
    const buttons = await page.$$('div[role="dialog"] button');
    for (const btn of buttons) {
      const text = await (await btn.getProperty('innerText')).jsonValue();
      if (text === 'Not Now') {
        await btn.click();
        console.log("✅ Popup fermé.");
        break;
      }
    }
  } catch (err) {
    console.log("ℹ️ Aucun popup à fermer.");
  }

  // ✏️ Ciblage du vrai champ de texte
  console.log("🟡 Attente du champ de message...");
  try {
    await page.waitForSelector('div[role="textbox"]', { timeout: 10000 });
    await page.type('div[role="textbox"]', message);
    await page.keyboard.press('Enter');
    console.log("✅ Message envoyé !");
  } catch (err) {
    console.error("❌ Champ de message non détecté :", err.message);
  }

  // Tu peux laisser le navigateur ouvert ou le fermer automatiquement :
  // await browser.close();
})();