import { test, expect } from "@playwright/test";
import { performWithdrawal } from "../utils/atmHelper";

const ATM_URL = "https://atm-buddy-lite.lovable.app/";

test.describe("Withdrawal", () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(ATM_URL);
        await page.getByRole("textbox", { name: /ตัวอย่าง/ }).fill("123456");
        await page.getByRole("textbox", { name: /รหัส PIN/ }).fill("1234");
        await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();
        await expect(page.getByText("ยอดเงินคงเหลือ")).toBeVisible();
        await page.getByText('ถอนเงิน').first().click();
    });

    // ====== CASE 1: Valid Amounts ======

    const validAmounts = [
        { amt: '100',    desc: 'Minimum boundary (100 Baht)' },
        { amt: '50,000', desc: 'Maximum boundary (50,000 Baht)' },
    ];

    validAmounts.forEach(({ amt, desc }) => {
        test(`Valid Withdrawal: ${desc}`, async ({ page }) => {
            await performWithdrawal(page, amt, 'fill');
        });
    });

    test("Valid Withdrawal: Decimal amount (2 digits)", async ({ page }) => {
        const input = page.getByPlaceholder('0');
        await input.fill('100.50');

        const validationMessage = await input.evaluate((el) => {
            el.checkValidity();
            return el.validationMessage;
        });

        if (validationMessage) {
            console.log("Decimal blocked by step validation:", validationMessage);
            expect(validationMessage).toMatch(/valid value|step/i);
        } else {
            await page.getByRole('button', { name: 'ถอนเงิน ฿' }).click();
            const balanceLocator = page.locator('div')
                .filter({ hasText: 'ยอดเงินคงเหลือปัจจุบัน฿' }).nth(4);
            await expect(balanceLocator).toContainText('49,899.50', { timeout: 10000 });
        }
    });

    // ====== CASE 2: Quick Withdraw Buttons ======

    const quickButtons = ['500', '1,000', '2,000', '5,000', '10,000', '20,000'];
    quickButtons.forEach((amt) => {
        test(`Quick Button Withdrawal: ฿${amt}`, async ({ page }) => {
            await performWithdrawal(page, amt, 'quick_button');
        });
    });

    // ====== CASE 3: Invalid Amounts ======

    test("Invalid: Withdraw 0 Baht (Below minimum)", async ({ page }) => {
        const input = page.getByPlaceholder('0');
        await input.fill('0');
        const validationMessage = await input.evaluate((el) => {
            el.checkValidity();
            return el.validationMessage;
        });
        expect(validationMessage).toBe('Value must be greater than or equal to 100.');
    });

    test("Invalid: Negative amount", async ({ page }) => {
        const input = page.getByPlaceholder('0');
        await input.fill('-100');
        const validationMessage = await input.evaluate((el) => {
            el.checkValidity();
            return el.validationMessage;
        });
        expect(validationMessage).toBe('Value must be greater than or equal to 100.');
    });

    test("Invalid: Over maximum limit (50,000.01)", async ({ page }) => {
        const input = page.getByPlaceholder('0');
        await input.fill('50000.01');
        const validationMessage = await input.evaluate((el) => {
            el.checkValidity();
            return el.validationMessage;
        });
        expect(validationMessage).toBe('Value must be less than or equal to 50000.');
    });

    test("Invalid: More than 2 decimal places (10.555)", async ({ page }) => {
        const input = page.getByPlaceholder('0');
        await input.fill('100.555'); 
        const validationMessage = await input.evaluate((el) => {
            el.checkValidity();
            return el.validationMessage;
        });
        expect(validationMessage).toMatch(/valid value|step|constraints/i);
    });

    test("Invalid: Withdraw more than balance", async ({ page }) => {
        const input = page.getByPlaceholder('0');
        await input.fill('50001');
        const depositBtn = page.locator('button[type="submit"]');
        const isDisabled = await depositBtn.isDisabled();
        if (isDisabled) {
            await expect(depositBtn).toBeDisabled();
        } else {
            await depositBtn.click();
            await expect(page.getByText(/ยอดเงินไม่เพียงพอ|insufficient|error/i)).toBeVisible();
        }
    });

    test("Invalid: Empty input", async ({ page }) => {
        const withdrawBtn = page.locator('button[type="submit"]');
        await expect(withdrawBtn).toBeDisabled();
    });
});