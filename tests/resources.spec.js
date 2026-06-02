const { expect, test } = require("@playwright/test");

test.describe("references page", () => {
  test("shows outside references only", async ({ page }) => {
    await page.goto("/pages/resources.html");
    await expect(page).toHaveTitle(/References/);
    await expect(page.locator("h1")).toHaveText("Outside references.");
    await expect(page.locator(".resource-card")).toHaveCount(6);

    const pageText = await page.locator("body").innerText();
    expect(pageText).not.toContain("Inside this site");
    expect(pageText).not.toContain("Related Aura of Intelligence project pages");
    expect(pageText).not.toContain("Legal Memory Workbench");
    expect(pageText).not.toContain("Straddie Noticeboard Network");

    const resourceLinks = await page.locator(".resource-card a").evaluateAll((links) => (
      links.map((link) => link.href)
    ));

    expect(resourceLinks.length).toBeGreaterThan(6);
    for (const href of resourceLinks) {
      expect(href).toMatch(/^https:\/\//);
      expect(href).not.toContain("auraofintelligence.github.io");
      expect(href).not.toContain("github.com/auraofintelligence");
    }
  });
});
