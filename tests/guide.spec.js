const { expect, test } = require("@playwright/test");

test.describe("guide page", () => {
  test("keeps the public notice example public", async ({ page }) => {
    await page.goto("/pages/guide.html");
    await expect(page).toHaveTitle(/Guide/);

    const example = page.locator("#example .markdown-window");
    await expect(example).toContainText("Public Facts");
    await expect(example).toContainText("Offer three friendly versions");
    await expect(example).toContainText("Questions To Check");
    await expect(example).toContainText("Public Review Notes");
    await expect(example).toContainText("Work from the public facts and source links in this file");
    await expect(example).not.toContainText("My Sharing Boundary");
    await expect(example).not.toContainText("Must Not Publish");
    await expect(example).not.toContainText("Private phone numbers");
    await expect(example).not.toContainText("Children's names");
    await expect(example).not.toContainText("decision_owner");
    await expect(example).not.toContainText("steward");
    await expect(example).not.toContainText("Create three short notice versions");

    const overflowX = await page.evaluate(() => (
      document.documentElement.scrollWidth - document.documentElement.clientWidth
    ));
    expect(overflowX).toBeLessThanOrEqual(0);
  });
});
