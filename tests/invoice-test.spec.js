// @ts-nocheck

import { test, expect } from '@playwright/test';

const BASE_URL = 'https://automationteststore.com/';

const generateRandomString = (/** @type {number} */ length) => {
    let result = '';
    const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

const parseGBP = (s) => Number.parseFloat(s.replace(/\s/g, '').replace('£', ''));


const goto_home = async (page) => {
    await page.goto(BASE_URL);
};

const set_currency_to_gbp = async (page) => {
    await page.locator('.headerdetails .nav').first().hover();

    await page.getByText(/£/).click();
};

const register = async (page, loginName, pwd, email) => {
    await page.getByText(/register/).first().click();


    await expect(page.locator('#accountFrm_accountregister')).toBeChecked();
    await page.getByRole('button', { name: 'Continue' }).first().click();

    await expect(page).toHaveURL(/.*create/);


    await page.locator('#AccountFrm_country_id').selectOption({ label: 'Hungary' });
    await page.locator('#AccountFrm_zone_id').selectOption({ label: 'Pest' });

    await page.locator('#AccountFrm_firstname').fill('John');
    await page.locator('#AccountFrm_lastname').fill('Doe');
    await page.locator('#AccountFrm_email').fill(email);
    await page.locator('#AccountFrm_address_1').fill('Fo utca 1');
    await page.locator('#AccountFrm_city').fill('Budapest');
    await page.locator('#AccountFrm_postcode').fill('1234');
    await page.locator('#AccountFrm_loginname').fill(loginName);
    await page.locator('#AccountFrm_password').fill(pwd);
    await page.locator('#AccountFrm_confirm').fill(pwd);

    await page.locator('#AccountFrm_agree').check();
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page).toHaveURL(/.*success/);
};

const add_products_to_cart = async (page) => {
    let totalSubCount = 0;

    const categoryLinks = page.locator('section#categorymenu ul.categorymenu > li > a[href*="rt=product/category"]');

    const categoryCount = await categoryLinks.count();
    for (let i = 0; i < categoryCount; i++) {
        const categoryLink = categoryLinks.nth(i);

        const categoryName = (await categoryLink.innerText()).trim();

        const categoryLi = categoryLink.locator('xpath=ancestor::li[1]');
        const subcategoryLinks = categoryLi.locator('div.subcategories a[href*="rt=product/category"]');

        const subCount = await subcategoryLinks.count();
        totalSubCount += subCount;

        for (let j = 0; j < subCount; j++) {
            const subLink = subcategoryLinks.nth(j);
            const subName = (await subLink.innerText()).trim();
            console.log(subName);
            const subHref = await subLink.getAttribute('href');

            await page.goto(subHref);

            const thumbnails = page
                .locator('.thumbnail:visible')
                .filter({ hasNot: page.locator('.nostock') })
                .filter({ hasNot: page.locator('.call_to_order') });

            const thumbCount = await thumbnails.count();

            const randomNum = Math.floor(Math.random() * thumbCount);

            await thumbnails.nth(randomNum).locator('img').first().click();

            await page.locator('#product_quantity').fill('1');
            await page.locator('a.cart').first().click();
        }
    }

    const quantity = page.locator('input[id*="cart_quantity"]');
    const quantityCount = await quantity.count();

    for (let i = 0; i < quantityCount; i++) {
        const val = await quantity.nth(i).inputValue();
        expect(val).toBe('1');
    }

    return totalSubCount;
};

const proceed_checkout = async (page) => {
    await page.getByText(/Checkout/).first().click();
    await page.locator('#checkout_btn').first().click();
    await page.getByText(/invoice page/).first().click();
};

const check_invoice = async (page, expectedLines) => {
    const rows = page.locator('table.invoice_products tr').filter({ has: page.locator('td') });
    const rowCount = await rows.count();

    expect(rowCount).toBe(expectedLines);

    for (let i = 0; i < rowCount; i++) {
        const row = rows.nth(i);

        const qtyText = (await row.locator('td').nth(3).innerText()).trim();
        const unitText = (await row.locator('td').nth(4).innerText()).trim();
        const totalText = (await row.locator('td').nth(5).innerText()).trim();

        expect(qtyText).toBe('1');
        expect(unitText.startsWith('£')).toBeTruthy();
        expect(totalText.startsWith('£')).toBeTruthy();
    }
};

test('invoice', async ({ page }) => {
    test.setTimeout(180_000);

    const loginName = generateRandomString(6);
    const pwd = generateRandomString(6);
    const email = loginName + '@' + loginName + '.com';

    await goto_home(page);

    await set_currency_to_gbp(page);

    await register(page, loginName, pwd, email);

    const totalSubCount = await add_products_to_cart(page);
    console.log(totalSubCount);

    await proceed_checkout(page);

    await check_invoice(page, totalSubCount);
});