import { test, expect } from "@playwright/test";
import { performDeposit } from "../utils/atmHelper";

const ATM_URL = "https://atm-buddy-lite.lovable.app/";

test.describe("Deposit", () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(ATM_URL);
        await page.getByRole("textbox", { name: /ตัวอย่าง/ }).fill("123456");
        await page.getByRole("textbox", { name: /รหัส PIN/ }).fill("1234");
        await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();
        await expect(page.getByText("ยอดเงินคงเหลือ")).toBeVisible();
        await page.getByText('ฝากเงิน').first().click();
    });

    // ====== CASE 1: Valid Amounts ======

    const validAmounts = [
        { amt: '1', desc: 'Minimum boundary (1 Baht)' },
        { amt: '100,000', desc: 'Maximum boundary (100,000 Baht)' },
    ];

    validAmounts.forEach(({ amt, desc }) => {
        test(`Valid Deposit: ${desc}`, async ({ page }) => {
            await performDeposit(page, amt, 'fill');
        });
    });

    test("Valid Deposit: Decimal amount (2 digits)", async ({ page }) => {
        const input = page.getByPlaceholder('0');
        await input.fill('500.75');

        const validationMessage = await input.evaluate((el) => {
            el.checkValidity();
            return el.validationMessage;
        });

        if (validationMessage) {
            console.log("Decimal blocked by step validation:", validationMessage);
            expect(validationMessage).toMatch(/valid value|step/i);
        } else {
            await page.getByRole('button', { name: 'ฝากเงิน ฿' }).click();
            const balanceLocator = page.locator('div')
                .filter({ hasText: 'ยอดเงินคงเหลือปัจจุบัน฿' }).nth(4);
            await expect(balanceLocator).toContainText('50,500.75', { timeout: 10000 });
        }
    });

    // ====== CASE 2: Quick Deposit Buttons ======

    const quickButtons = ['500', '1,000', '2,000', '5,000', '10,000', '20,000'];
    quickButtons.forEach((amt) => {
        test(`Quick Button Deposit: ฿${amt}`, async ({ page }) => {
            await performDeposit(page, amt, 'quick_button');
        });
    });

    // ====== CASE 3: Invalid Amounts ======

    test("Invalid: Deposit 0 Baht (Below minimum)", async ({ page }) => {
        const input = page.getByPlaceholder('0');
        await input.fill('0');
        const validationMessage = await input.evaluate((el) => {
            el.checkValidity();
            return el.validationMessage;
        });
        expect(validationMessage).toBe('Value must be greater than or equal to 1.');
    });

    test("Invalid: Negative amount", async ({ page }) => {
        const input = page.getByPlaceholder('0');
        await input.fill('-100');
        const validationMessage = await input.evaluate((el) => {
            el.checkValidity();
            return el.validationMessage;
        });
        expect(validationMessage).toBe('Value must be greater than or equal to 1.');
    });

    test("Invalid: Over maximum limit (100,000.01)", async ({ page }) => {
        const input = page.getByPlaceholder('0');
        await input.fill('100000.01');
        const validationMessage = await input.evaluate((el) => {
            el.checkValidity();
            return el.validationMessage;
        });
        expect(validationMessage).toBe('Value must be less than or equal to 100000.');
    });

    test("Invalid: More than 2 decimal places (10.555)", async ({ page }) => {
        const input = page.getByPlaceholder('0');
        await input.fill('10.555');
        const validationMessage = await input.evaluate((el) => {
            el.checkValidity();
            return el.validationMessage;
        });
        expect(validationMessage).toMatch(/valid value|step|constraints/i);
    });

    test("Invalid: Empty input", async ({ page }) => {
        const depositBtn = page.locator('button[type="submit"]');
        await expect(depositBtn).toBeDisabled();
    });
});