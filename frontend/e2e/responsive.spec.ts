import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const VIEWPORTS = [
  { name: '320x568', width: 320, height: 568 },
  { name: '360x800', width: 360, height: 800 },
  { name: '375x667', width: 375, height: 667 },
  { name: '390x844', width: 390, height: 844 },
  { name: '412x915', width: 412, height: 915 },
  { name: '430x932', width: 430, height: 932 },
  { name: '844x390', width: 844, height: 390 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '820x1180', width: 820, height: 1180 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '1280x800', width: 1280, height: 800 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '2560x1440', width: 2560, height: 1440 },
];

const TEST_ROUTES = [
  '/',
  '/login',
  '/register',
  '/brokers',
  '/brokers/compare',
  '/courses',
  '/dashboard/broker/onboarding',
];

for (const vp of VIEWPORTS) {
  test.describe(`Viewport ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    for (const route of TEST_ROUTES) {
      test(`Audit ${route} @ ${vp.name}`, async ({ page }) => {
        const consoleErrors: string[] = [];
        page.on('console', (msg) => {
          if (msg.type() === 'error') consoleErrors.push(msg.text());
        });

        await page.goto(route, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(500);

        // Check horizontal overflow
        const overflow = await page.evaluate(() => {
          const docWidth = document.documentElement.scrollWidth;
          const winWidth = window.innerWidth;
          const bodyWidth = document.body.scrollWidth;
          return {
            hasOverflow: docWidth > winWidth + 1 || bodyWidth > winWidth + 1,
            docWidth,
            winWidth,
            bodyWidth,
          };
        });

        // Screenshot
        const safeRoute = route === '/' ? 'home' : route.replace(/\//g, '_');
        await page.screenshot({
          path: `e2e/__screens__/${safeRoute}/${vp.name}.png`,
          fullPage: false,
        });

        // Verify no unexpected overflow
        expect(overflow.hasOverflow, `Route ${route} has horizontal overflow at ${vp.name}: docWidth=${overflow.docWidth}, winWidth=${overflow.winWidth}`).toBeFalsy();
      });
    }
  });
}
