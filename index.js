const puppeteer = require('puppeteer');
const stores = require('./input').stores

const browserOptions = {
  headless: false,
  defaultViewport: {
    width: 1920,
    height: 1080,
  },
  args: [
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--disable-setuid-sandbox',
    '--no-first-run',
    '--no-sandbox',
    '--no-zygote',
    // '--single-process', // <- this one doesn't works in Windows
  ]
};

async function scraping() {
  try {
    const browser = await puppeteer.launch(browserOptions);
    for (var key in stores) {
      const {
        store_name,
        checkout_url,
        discount_code
      } = stores[key]
      const page = await browser.newPage();
      
      await page.goto(checkout_url, {
      });
      
      let discountSelector = ''
      let discountShowButton = ''
      let discountButton = ''
      let discountAmount = ''
      if (store_name === 'Equelle') {
        discountSelector = '#checkout_discount_code'
        discountShowButton = '#show-discount-form-link'
        discountButton = '#apply_discount'
        discountAmount = '#discount_amount'
        await page.click(discountShowButton);
        await page.waitForSelector(discountSelector);
        await page.evaluate(({discountSelector, discount_code}) => {
          const code = document.querySelector(discountSelector);
          code.value = discount_code;
        }, {discountSelector, discount_code});
        await page.click(discountButton);
        await page.waitForTimeout(1 * 1000)
        let element = await page.$(discountAmount)
        let value = await page.evaluate(el => el.textContent, element)
        console.log(`${store_name}'s discount = `, value)
      }
      await page.close();
      await browser.close();
    }
  } catch (error) {
    console.log('Error Happened', error)
  }
}

scraping()

