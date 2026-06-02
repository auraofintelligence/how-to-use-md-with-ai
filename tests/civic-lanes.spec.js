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

const ecosystemCardOrder = [
  "Profile Builder",
  "Aura Builder",
  "Straddie Noticeboard Network",
  "Straddie Shared Table",
  "Straddie Night Market Lab",
  "Straddie Disaster Kiosks",
  "Stradbroke Grants Lab",
  "Legal Memory Workbench",
  "Film Club Documentary Builders",
  "Ready S.E.T. Co-op Trust Hub",
  "Straddie Digital Twin Builders",
  "Ballow Road Sand and Screen Hub",
  "Straddie Maker-Space Lab",
  "Purple Party for Australia",
  "GAJRA Earth public hub"
];

test.describe("civic lanes page", () => {
  test("uses real starter files and the requested ecosystem card order", async ({ page }) => {
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
    await expect(page.locator(".ecosystem-grid h3")).toHaveText(ecosystemCardOrder);
    await expect(page.locator(".ecosystem-grid article")).toHaveCount(15);
    await expect(page.locator(".ecosystem-grid article .card-actions a")).toHaveCount(30);
    await expect(page.locator(".civic-links")).toHaveCount(0);
    await expect(page.locator("body")).not.toContainText("Inside this site");
    await expect(page.locator("body")).not.toContainText("Related Aura of Intelligence project pages");
    await expect(page.locator(".strange-true-bridge")).toHaveCount(1);
    await expect(page.locator(".strange-true-bridge img")).toHaveAttribute("src", "../assets/strange-but-true-banner.webp");
    await expect(page.locator(".strange-true-bridge")).toContainText("Strange but True");
    await expect(page.locator(".strange-true-bridge a")).toHaveAttribute("href", "https://auraofintelligence.github.io/strange-but-true/");

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
