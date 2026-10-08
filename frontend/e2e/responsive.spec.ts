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
  '/about',
  '/contact',
  '/brokers',
  '/brokers/compare',
  '/courses',
  '/complaint-box',
  '/login',
  '/register',
  '/forgot-password',
  '/dashboard',
  '/dashboard/enrollments',
  '/dashboard/broker',
  '/dashboard/broker/onboarding',
  '/dashboard/tutor',
  '/dashboard/signal-provider',
  '/admin',
  '/admin/brokers',
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

test('Mobile Navigation Drawer Interaction @ 375x667', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  const menuBtn = page.locator('button[aria-label="Toggle Menu"]');
  await expect(menuBtn).toBeVisible();
  await menuBtn.click();
  await page.waitForTimeout(500);

  const drawer = page.locator('div[aria-label="Mobile Navigation"]');
  await expect(drawer).toBeVisible();

  const box = await drawer.boundingBox();
  expect(box?.height).toBeGreaterThan(600);

  await page.screenshot({ path: 'e2e/__screens__/mobile_menu_open.png', fullPage: false });

  const closeBtn = page.locator('button[aria-label="Close Menu"]');
  await closeBtn.click();
  await page.waitForTimeout(300);
  await expect(drawer).not.toBeVisible();
});

test('Dashboard Mobile Scrolling & Drawer @ 375x667', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  const p = Buffer.from(JSON.stringify({ userId: '1', role: 'BROKER', exp: Math.floor(Date.now() / 1000) + 86400 })).toString('base64');
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + p + '.sig';
  await page.context().addCookies([
    { name: 'edutrade_token', value: token, url: 'http://localhost:3000' },
    { name: 'edutrade_role', value: 'BROKER', url: 'http://localhost:3000' },
  ]);
  await page.route('**/api/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { status: 'PENDING', slug: 'test-broker' } }) }));
  await page.addInitScript(({ token }) => {
    localStorage.setItem('edutrade_user', JSON.stringify({ id: '1', name: 'Broker User', email: 'broker@test.com', role: 'BROKER' }));
    localStorage.setItem('edutrade_token', token);
  }, { token });

  await page.goto('/dashboard/broker', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  // Test window scrolling
  await page.evaluate(() => window.scrollTo(0, 350));
  await page.waitForTimeout(300);
  const scrolledY = await page.evaluate(() => window.scrollY);
  expect(scrolledY).toBeGreaterThanOrEqual(300);

  // Test dashboard drawer opening and closing
  const dashMenuBtn = page.locator('button[aria-label="Open navigation menu"]');
  await expect(dashMenuBtn).toBeVisible();
  await dashMenuBtn.click();
  await page.waitForTimeout(400);

  const dashDrawer = page.locator('aside');
  await expect(dashDrawer.last()).toBeVisible();

  const closeSidebarBtn = page.locator('button[aria-label="Close sidebar"]');
  await expect(closeSidebarBtn).toBeVisible();
  await closeSidebarBtn.click();
  await page.waitForTimeout(300);
});
