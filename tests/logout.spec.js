import { test, expect } from "@playwright/test";

const URL = "https://atm-buddy-lite.lovable.app/?fbclid=IwZXh0bgNhZW0CMTAAYnJpZBExY1RVU2UzVlhZNU1ZVFV6SwEeG95HaKRUZ4S4SsfHUDDsw3FFGPEyhRh_Fn_77KciqvuNxyxd4FkEFK02O9c_aem_ycGlUd5UYRQc-LADxvwcLQ";

test("Logout", async ({ page }) => {
  await page.goto(URL);

  // login ก่อน
  await page.getByRole("textbox", { name: "ตัวอย่าง: 123456" }).fill("123456");
  await page.getByRole("textbox", { name: "รหัส PIN 4 หลัก" }).fill("1234");
  await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();
  await expect(page.getByRole("button", { name: "ออกจากระบบ" })).toBeVisible();

  // logout
  await page.getByRole("button", { name: "ออกจากระบบ" }).click();

  await expect(page.getByRole("button", { name: "ออกจากระบบ" })).not.toBeVisible();

  await expect(page.getByRole("button", { name: "เข้าสู่ระบบ" })).toBeVisible();

  await expect(page.getByRole("heading", { name: "เข้าสู่ระบบ" })).toBeVisible();
});