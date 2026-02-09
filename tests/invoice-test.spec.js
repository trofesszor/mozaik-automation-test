// @ts-check

import { test, expect } from '@playwright/test';

test('invoice', async ({ page }) => {
    await page.goto('https://automationteststore.com/');

    await page.getByText(/register/).click();

    await expect(page.locator('#accountFrm_accountregister')).toBeChecked();
    await page.getByRole('button', { name: 'Continue' }).click();

    await page.locator('#AccountFrm_firstname').fill('John');
    await page.locator('#AccountFrm_lastname').fill('Doe');
    await page.locator('#AccountFrm_email').fill('test@asd.com');
    await page.locator('#AccountFrm_address_1').fill('Fo utca 1');
    await page.locator('#AccountFrm_city').fill('Budapest');
    // TODO: region/state
    await page.locator('#AccountFrm_postcode').fill('1234');
    // TODO: country
    await page.locator('#AccountFrm_loginname').fill('johndoe');
    await page.locator('#AccountFrm_password').fill('password');
    await page.locator('#AccountFrm_confirm').fill('password');


    await expect(page).toHaveURL(/.*create/);
});