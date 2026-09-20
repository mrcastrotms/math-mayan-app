import { test, expect } from "@playwright/test";

test("teacher can reach the accessible classwork assignment form", async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("teacher_authorized", "true");
    sessionStorage.setItem("exam_active_view", "dashboard");
    localStorage.setItem("math_app_sections", JSON.stringify(["4A", "5B"]));
  });

  await page.goto("/?view=dashboard");

  await expect(page.getByRole("heading", { name: "Assign Classwork" })).toBeVisible();
  await expect(page.getByLabel("Title")).toBeVisible();
  await expect(page.getByRole("combobox").filter({ has: page.locator("option") }).last()).toBeVisible();
  await expect(page.getByLabel("Due date and time")).toBeVisible();
  await expect(page.getByLabel("Questions")).toBeVisible();
  await expect(page.getByRole("button", { name: "Post assigned work" })).toBeVisible();
});

test("teacher must review generated/manual answer keys before publishing", async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("teacher_authorized", "true");
    sessionStorage.setItem("exam_active_view", "dashboard");
    localStorage.setItem("math_app_sections", JSON.stringify(["4A"]));
  });
  await page.goto("/?view=dashboard");
  await page.getByLabel("Title").fill("Powers practice");
  await page.getByLabel("Due date and time").fill("2099-09-21T11:45");
  await page.getByLabel("Questions").fill("Write 4^4 | 4 × 4 × 4 × 4");
  await page.getByRole("button", { name: "Post assigned work" }).click();
  await expect(page.getByText("Answer key review")).toBeVisible();
  await expect(page.getByLabel("Verified answer")).toHaveValue("4 × 4 × 4 × 4");
  await expect(page.getByRole("button", { name: "Confirm answer key and publish" })).toBeVisible();
});
