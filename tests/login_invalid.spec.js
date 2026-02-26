import { test, expect } from "@playwright/test";

const URL = "https://atm-buddy-lite.lovable.app/";

test.describe("Login Functionality - Invalid Cases", () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  test("Invalid account format", async ({ page }) => {
    await page.getByRole("textbox", { name: "ตัวอย่าง: 123456" }).fill("invalid_user");
    await page.getByRole("textbox", { name: "รหัส PIN 4 หลัก" }).fill("1234");
    await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();

    await expect(page.getByText("ข้อมูลไม่ถูกต้อง", { exact: true })).toBeVisible();
  });

  test("Invalid Account Number", async ({ page }) => {
    await page.getByRole("textbox", { name: "ตัวอย่าง: 123456" }).fill("000000");
    await page.getByRole("textbox", { name: "รหัส PIN 4 หลัก" }).fill("1234");
    await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();

    await expect(page.getByText("ข้อมูลไม่ถูกต้อง", { exact: true })).toBeVisible();
  });

  test("Invalid PIN", async ({ page }) => {
    await page.getByRole("textbox", { name: "ตัวอย่าง: 123456" }).fill("123456");
    await page.getByRole("textbox", { name: "รหัส PIN 4 หลัก" }).fill("9999");
    await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();

    await expect(page.getByText("ข้อมูลไม่ถูกต้อง", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "ออกจากระบบ" })).not.toBeVisible();
  });
});