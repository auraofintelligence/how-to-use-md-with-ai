const { expect, test } = require("@playwright/test");

test.describe("guide page", () => {
  test("uses self-sovereign example language", async ({ page }) => {
    await page.goto("/pages/guide.html");
    await expect(page).toHaveTitle(/Guide/);

    const example = page.locator("#example .markdown-window");
    await expect(example).toContainText("My Sharing Boundary");
    await expect(example).toContainText("Please offer three notice options I can choose from");
    await expect(example).toContainText("The organiser or steward makes the final choice");
    await expect(example).toContainText("mark it as a question instead");
    await expect(example).not.toContainText("Must Not Publish");
    await expect(example).not.toContainText("Create three short notice versions");

    const overflowX = await page.evaluate(() => (
      document.documentElement.scrollWidth - document.documentElement.clientWidth
    ));
    expect(overflowX).toBeLessThanOrEqual(0);
  });
});
