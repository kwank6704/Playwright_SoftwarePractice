import { test, expect } from "@playwright/test";

test("Log in sucess", async ({ page }) => {
  await page.goto(
    "https://atm-buddy-lite.lovable.app/?fbclid=IwZXh0bgNhZW0CMTAAYnJpZBExY1RVU2UzVlhZNU1ZVFV6SwEeG95HaKRUZ4S4SsfHUDDsw3FFGPEyhRh_Fn_77KciqvuNxyxd4FkEFK02O9c_aem_ycGlUd5UYRQc-LADxvwcLQ",
  );
  
  await page.getByRole("textbox", { name: "ตัวอย่าง: 123456" }).fill("123456");
  await page.getByRole("textbox", { name: "รหัส PIN 4 หลัก" }).fill("1234");
  
  await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();

  await expect(page.getByText("เข้าสู่ระบบสำเร็จ", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "ออกจากระบบ" })).toBeVisible();
  await expect(page.getByText("123456")).toBeVisible();
});