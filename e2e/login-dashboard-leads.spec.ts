import { test, expect } from "@playwright/test";

const TEST_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD;

test.describe("Smoke (public)", () => {
  test("homepage loads", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("link", { name: /LeadHandler\.ai/i }).or(page.getByRole("heading", { name: /LeadHandler|SMS lead/i }))
    ).toBeVisible();
  });

  test("waitlist modal opens from Claim Beta Spot", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Claim Beta Spot/i }).first().click();
    await expect(page.getByRole("dialog").getByText(/Join the beta waitlist/i)).toBeVisible();
    await expect(page.getByLabel(/email/i).or(page.getByPlaceholder(/you@brokerage/i))).toBeVisible();
  });
});

test.describe("Login → Dashboard → Leads → One lead → Back", () => {
  test.skip(
    !TEST_EMAIL || !TEST_PASSWORD,
    "Set TEST_USER_EMAIL and TEST_USER_PASSWORD to run this e2e test"
  );

  test("full flow with no console errors", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /Broker Login|Sign in/i })).toBeVisible();

    await page.getByLabel(/email/i).fill(TEST_EMAIL!);
    await page.getByLabel(/password/i).fill(TEST_PASSWORD!);
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/app\/dashboard/);
    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();

    await page.getByRole("link", { name: /leads/i }).first().click();
    await expect(page).toHaveURL(/\/app\/leads/);

    const firstLeadLink = page.locator("main a[href^='/app/leads/']").first();
    await firstLeadLink.click();
    await expect(page).toHaveURL(/\/app\/leads\/[^/]+/);

    await page.goBack();
    await expect(page).toHaveURL(/\/app\/leads/);

    expect(consoleErrors.filter((e) => !e.includes("favicon"))).toEqual([]);
  });

  test("dashboard shows after login with at least one section", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill(TEST_EMAIL!);
    await page.getByLabel(/password/i).fill(TEST_PASSWORD!);
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/app\/dashboard/);
    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /recent activity|recent messages|trusted by|my recent leads/i })
    ).toBeVisible();
  });

  test("dashboard shows role in UI after login", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill(TEST_EMAIL!);
    await page.getByLabel(/password/i).fill(TEST_PASSWORD!);
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/app\/dashboard/);
    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
    // Topbar shows "Viewing as {role}" for role-based UI
    await expect(page.getByText(/Viewing as/i)).toBeVisible();
  });
});
