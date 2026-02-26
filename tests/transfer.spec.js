import { test, expect } from "@playwright/test";
import { performTransfer } from "../utils/atmHelper";

const ATM_URL = "https://atm-buddy-lite.lovable.app/";
const RECEIVER = "789012";

test.describe("Transfer", () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(ATM_URL);
        await page.getByRole("textbox", { name: /ตัวอย่าง/ }).fill("123456");
        await page.getByRole("textbox", { name: /รหัส PIN/ }).fill("1234");
        await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();
        await expect(page.getByText("ยอดเงินคงเหลือ")).toBeVisible();
        await page.getByText('โอนเงิน').first().click();
    });

    // ====== CASE 1: Valid Transfer ======

    test("Valid Transfer: Minimum amount (1 Baht)", async ({ page }) => {
        await performTransfer(page, { account: RECEIVER, amount: '1' });
    });

    test("Valid Transfer: With remark", async ({ page }) => {
        await performTransfer(page, { account: RECEIVER, amount: '1,000', remark: 'เงินค่าอาหาร' });
    });

    test("Valid Transfer: Remark max length (50 chars)", async ({ page }) => {
        await performTransfer(page, { account: RECEIVER, amount: '1,000', remark: 'A'.repeat(50) });
    });

    test("Valid Transfer: No remark (optional)", async ({ page }) => {
        await performTransfer(page, { account: RECEIVER, amount: '500' });
    });

    // ====== CASE 2: Quick Transfer Buttons ======

    const quickAmounts = ['1,000', '2,000', '5,000', '10,000', '20,000', '50,000'];
    quickAmounts.forEach((amt) => {
        test(`Quick Button Transfer: ฿${amt}`, async ({ page }) => {
            await performTransfer(page, { account: RECEIVER, amount: amt }, 'quick_button');
        });
    });

    // ====== CASE 3: Invalid Account ======

    test("Invalid: Own account number", async ({ page }) => {
        await page.getByPlaceholder(/หมายเลขบัญชี/).fill('123456');
        await page.locator('input[placeholder="0"]').fill('1000');
        await page.getByRole('button', { name: /โอนเงิน/ }).click();
        await expect(page.getByText(/ไม่สามารถ|ตัวเอง|same|cannot|error/i).first()).toBeVisible({ timeout: 5000 });
    });

    test("Invalid: Non-existent account", async ({ page }) => {
        await page.getByPlaceholder(/หมายเลขบัญชี/).fill('000000');
        await page.locator('input[placeholder="0"]').fill('1000');
        await page.getByRole('button', { name: /โอนเงิน/ }).click();
        await expect(page.getByText(/ไม่พบ|not found|error/i).first()).toBeVisible({ timeout: 5000 });
    });

    test("Invalid: Empty account number", async ({ page }) => {
        await page.locator('input[placeholder="0"]').fill('1000');
        const submitBtn = page.locator('button[type="submit"]');
        const isDisabled = await submitBtn.isDisabled();
        if (isDisabled) {
            await expect(submitBtn).toBeDisabled();
        } else {
            await submitBtn.click();
            const input = page.getByPlaceholder(/หมายเลขบัญชี/);
            const msg = await input.evaluate((el) => el.validationMessage);
            expect(msg).toBeTruthy();
        }
    });

    // ====== CASE 4: Invalid Amount ======

    test("Invalid: Amount 0 (Below minimum)", async ({ page }) => {
        await page.getByPlaceholder(/หมายเลขบัญชี/).fill(RECEIVER);
        const input = page.locator('input[placeholder="0"]');
        await input.fill('0');
        const msg = await input.evaluate((el) => { el.checkValidity(); return el.validationMessage; });
        expect(msg).toMatch(/greater than or equal to 1/i);
    });

    test("Invalid: Over maximum limit", async ({ page }) => {
        await page.getByPlaceholder(/หมายเลขบัญชี/).fill(RECEIVER);
        const input = page.locator('input[placeholder="0"]');
        await input.fill('999999');
        const msg = await input.evaluate((el) => { el.checkValidity(); return el.validationMessage; });
        expect(msg).toMatch(/less than or equal to/i);
        console.log("Max limit validation:", msg);
    });

    test("Invalid: Transfer more than balance", async ({ page }) => {
        await page.getByPlaceholder(/หมายเลขบัญชี/).fill(RECEIVER);
        const rawBal = await page.locator('div')
            .filter({ hasText: 'ยอดเงินคงเหลือปัจจุบัน฿' }).nth(4).textContent();
        const match = rawBal.match(/฿([\d,]+\.?\d*)/);
        const balance = match ? parseFloat(match[1].replace(/,/g, '')) : 0;
        await page.locator('input[placeholder="0"]').fill((balance + 1).toString());
        await expect(page.locator('button[type="submit"]')).toBeDisabled();
    });

    test("Invalid: Empty amount", async ({ page }) => {
        await page.getByPlaceholder(/หมายเลขบัญชี/).fill(RECEIVER);
        await expect(page.locator('button[type="submit"]')).toBeDisabled();
    });

    // ====== CASE 5: Invalid Remark ======

    test("Invalid: Remark over 50 characters", async ({ page }) => {
        const remarkInput = page.getByPlaceholder(/เงินค่าอาหาร/);
        await remarkInput.fill('A'.repeat(51));
        const value = await remarkInput.inputValue();
        expect(value.length).toBeLessThanOrEqual(50);
    });
});