const { expect, test } = require("@playwright/test");

const inventedFilenames = [
  "private-support-note.md",
  "team-brief.md",
  "public-notice.md",
  "public-outcome-note.md"
];

const realStarterFilenames = [
  "aura.md",
  "profile.md",
  "business-profile.md",
  "public_noticeboard.md"
];

test.describe("civic lanes page", () => {
  test("uses real starter Markdown filenames in the visual board and keeps project links compact", async ({ page }) => {
    const consoleProblems = [];
    page.on("console", (message) => {
      if (["error", "warning"].includes(message.type())) {
        consoleProblems.push(`${message.type()}: ${message.text()}`);
      }
    });
    page.on("pageerror", (error) => consoleProblems.push(`pageerror: ${error.message}`));

    await page.goto("/pages/civic-lanes.html");
    await expect(page).toHaveTitle(/Civic Lanes/);
    await expect(page.locator("body")).toContainText("A North Stradbroke Island example");
    await expect(page.locator(".audience-strip h2")).toHaveText([
      "1. Write the private version",
      "2. Make the useful version",
      "3. Publish the approved version"
    ]);

    const pageText = await page.locator("body").innerText();
    for (const name of inventedFilenames) {
      expect(pageText, `${name} should not be used as an example`).not.toContain(name);
    }
    for (const name of realStarterFilenames) {
      expect(pageText, `${name} should be visible as a real starter example`).toContain(name);
    }

    await expect(page.locator(".scene-board")).toHaveCount(1);
    await expect(page.locator(".scene-board strong")).toHaveText(realStarterFilenames);
    await expect(page.locator(".compact-link-list a")).toHaveCount(10);

    const overflowX = await page.evaluate(() => (
      document.documentElement.scrollWidth - document.documentElement.clientWidth
    ));
    expect(overflowX).toBeLessThanOrEqual(0);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator(".to-top").click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(40);

    expect(consoleProblems).toEqual([]);
  });
});
