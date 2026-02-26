import { expect } from "@playwright/test";

function parseBalance(rawText) {
    const match = rawText.match(/฿([\d,]+\.?\d*)/);
    if (!match) return 0;
    return parseFloat(match[1].replace(/,/g, ''));
}

export async function performDeposit(page, amount, method) {
    const amountNumber = parseFloat(amount.replace(/,/g, ''));

    const rawCurrentBalance = await page.locator('div')
        .filter({ hasText: 'ยอดเงินคงเหลือปัจจุบัน฿' }).nth(4).textContent();
    const currentBalanceNumber = parseBalance(rawCurrentBalance);
    const expectedBalanceNumber = Math.round((currentBalanceNumber + amountNumber) * 100) / 100;
    const expectedBalanceText = expectedBalanceNumber.toLocaleString('en-US', { minimumFractionDigits: 2 });

    if (method === 'fill') {
        await page.getByPlaceholder('0').fill(amountNumber.toString());
    } else if (method === 'quick_button') {
        await page.getByRole('button', { name: amount }).click();
    }

    await page.getByRole('button', { name: 'ฝากเงิน ฿' }).click();

    const balanceLocator = page.locator('div').filter({ hasText: 'ยอดเงินคงเหลือปัจจุบัน฿' }).nth(4);
    await expect(balanceLocator).toContainText(expectedBalanceText, { timeout: 10000 });
    console.log("Current Balance: ", currentBalanceNumber);
    console.log("New Balance: ", expectedBalanceNumber);
}

export async function performWithdrawal(page, amount, method) {
    const amountNumber = parseFloat(amount.replace(/,/g, ''));

    const rawCurrentBalance = await page.locator('div')
        .filter({ hasText: 'ยอดเงินคงเหลือปัจจุบัน฿' }).nth(4).textContent();
    const currentBalanceNumber = parseBalance(rawCurrentBalance);
    const expectedBalanceNumber = Math.round((currentBalanceNumber - amountNumber) * 100) / 100;
    const expectedBalanceText = expectedBalanceNumber.toLocaleString('en-US', { minimumFractionDigits: 2 });

    if (method === 'fill') {
        await page.getByPlaceholder('0').fill(amountNumber.toString());
    } else if (method === 'quick_button') {
        await page.getByRole('button', { name: amount }).click();
    }

    await page.getByRole('button', { name: 'ถอนเงิน ฿' }).click();

    const balanceLocator = page.locator('div').filter({ hasText: 'ยอดเงินคงเหลือปัจจุบัน฿' }).nth(4);
    await expect(balanceLocator).toContainText(expectedBalanceText, { timeout: 10000 });
    console.log("Current Balance: ", currentBalanceNumber);
    console.log("New Balance: ", expectedBalanceNumber);
}

export async function performTransfer(page, { account, amount, remark }, method = 'fill') {
    const amountNumber = parseFloat(amount.replace(/,/g, ''));

    const rawCurrentBalance = await page.locator('div')
        .filter({ hasText: 'ยอดเงินคงเหลือปัจจุบัน฿' }).nth(4).textContent();
    const currentBalanceNumber = parseBalance(rawCurrentBalance);
    const expectedBalanceNumber = Math.round((currentBalanceNumber - amountNumber) * 100) / 100;
    const expectedBalanceText = expectedBalanceNumber.toLocaleString('en-US', { minimumFractionDigits: 2 });

    await page.getByPlaceholder(/หมายเลขบัญชี/).fill(account);

    if (method === 'quick_button') {
        await page.getByRole('button', { name: `฿${amount}` }).click();
    } else {
        await page.locator('input[placeholder="0"]').fill(amountNumber.toString());
    }

    if (remark) {
        await page.getByPlaceholder(/เงินค่าอาหาร/).fill(remark);
    }

    await page.getByRole('button', { name: /โอนเงิน/ }).click();
    await expect(page.getByText('โอนเงินสำเร็จ').first()).toBeVisible({ timeout: 10000 });

    const balanceLocator = page.locator('div').filter({ hasText: 'ยอดเงินคงเหลือปัจจุบัน฿' }).nth(4);
    await expect(balanceLocator).toContainText(expectedBalanceText, { timeout: 10000 });
    console.log("Current Balance: ", currentBalanceNumber);
    console.log("New Balance: ", expectedBalanceNumber);
}