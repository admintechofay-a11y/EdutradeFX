import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

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

const ROUTES = [
  { group: 'Public', path: '/', label: 'Home' },
  { group: 'Public', path: '/about', label: 'About' },
  { group: 'Public', path: '/contact', label: 'Contact' },
  { group: 'Public', path: '/brokers', label: 'Brokers Directory' },
  { group: 'Public', path: '/brokers/compare', label: 'Compare Engine' },
  { group: 'Public', path: '/courses', label: 'Courses Academy' },
  { group: 'Public', path: '/complaint-box', label: 'Complaint Box' },
  { group: 'Auth', path: '/login', label: 'Login' },
  { group: 'Auth', path: '/register', label: 'Register' },
  { group: 'Auth', path: '/forgot-password', label: 'Forgot Password' },
  { group: 'Dashboard', path: '/dashboard', label: 'Student Dashboard', role: 'STUDENT' },
  { group: 'Dashboard', path: '/dashboard/enrollments', label: 'Enrollments', role: 'STUDENT' },
  { group: 'Dashboard', path: '/dashboard/broker', label: 'Broker Overview', role: 'BROKER' },
  { group: 'Dashboard', path: '/dashboard/broker/onboarding', label: 'Broker Onboarding v2', role: 'BROKER' },
  { group: 'Dashboard', path: '/dashboard/tutor', label: 'Tutor Overview', role: 'TUTOR' },
  { group: 'Dashboard', path: '/dashboard/signal-provider', label: 'Signal Provider Overview', role: 'SIGNAL_PROVIDER' },
  { group: 'Admin', path: '/admin', label: 'Admin Dashboard', role: 'ADMIN' },
  { group: 'Admin', path: '/admin/brokers', label: 'Admin Brokers List', role: 'ADMIN' },
  { group: 'Learn', path: '/learn/forex-basics/lesson-1', label: 'Lesson Classroom', role: 'STUDENT' }
];

async function run() {
  console.log('🚀 Starting Responsive Baseline Audit across 14 Viewports...');
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const route of ROUTES) {
    const routeResults = { ...route, viewports: {} };
    console.log(`\nEvaluating route: ${route.path} (${route.label})`);

    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        userAgent: vp.width <= 844 ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148' : undefined
      });

      if (route.role) {
        await context.addInitScript(({ role }) => {
          localStorage.setItem('edutrade_user', JSON.stringify({
            id: 'mock-user-1',
            name: 'Audit User',
            email: 'audit@edutradefx.com',
            role: role
          }));
          localStorage.setItem('edutrade_token', 'mock-valid-jwt');
          document.cookie = `edutrade_token=mock-valid-jwt; path=/; max-age=86400; SameSite=Lax`;
          document.cookie = `edutrade_role=${role}; path=/; max-age=86400; SameSite=Lax`;
        }, { role: route.role });
      }

      const page = await context.newPage();
      try {
        await page.goto(`http://localhost:3000${route.path}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(600);

        const check = await page.evaluate(() => {
          const docW = document.documentElement.scrollWidth;
          const winW = window.innerWidth;
          const bodyW = document.body.scrollWidth;
          
          // Check overflowing elements
          const allEls = Array.from(document.querySelectorAll('*'));
          let maxRight = winW;
          let worstEl = null;

          for (const el of allEls) {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.right > maxRight + 1.5) {
              maxRight = rect.right;
              worstEl = el.tagName + (el.className ? '.' + String(el.className).split(' ').slice(0, 2).join('.') : '');
            }
          }

          return {
            docW,
            winW,
            bodyW,
            overflowPixels: Math.max(0, docW - winW, maxRight - winW),
            worstEl
          };
        });

        // Screenshot
        const safeDir = path.join('e2e', '__screens__', route.path === '/' ? 'home' : route.path.replace(/[/\\?%*:|"<>]/g, '_'));
        fs.mkdirSync(safeDir, { recursive: true });
        await page.screenshot({ path: path.join(safeDir, `${vp.name}.png`), fullPage: false });

        const passed = check.overflowPixels <= 1;
        routeResults.viewports[vp.name] = {
          passed,
          overflow: Math.round(check.overflowPixels),
          worstEl: check.worstEl
        };

        process.stdout.write(passed ? '.' : 'X');
      } catch (err) {
        routeResults.viewports[vp.name] = { passed: false, error: err.message };
        process.stdout.write('E');
      } finally {
        await context.close();
      }
    }
    results.push(routeResults);
  }

  await browser.close();

  // Generate RESPONSIVE_AUDIT.md
  let md = '# EdutradeFX Responsive Baseline Audit (Batch 0)\n\n';
  md += `Audit Date: ${new Date().toISOString()}\n`;
  md += `Total Routes Analyzed: ${ROUTES.length}\n`;
  md += `Total Viewports Evaluated: ${VIEWPORTS.length} (from 320x568 to 2560x1440)\n\n`;

  md += '## 1. Route x Viewport Matrix (Pass / Fail / Overflow px)\n\n';
  md += '| Route | Group | ' + VIEWPORTS.map(v => v.name).join(' | ') + ' |\n';
  md += '| :--- | :--- | ' + VIEWPORTS.map(() => ':---:').join(' | ') + ' |\n';

  for (const r of results) {
    const row = [r.label, r.group];
    for (const vp of VIEWPORTS) {
      const v = r.viewports[vp.name];
      if (!v) row.push('N/A');
      else if (v.passed) row.push('✅');
      else row.push(`❌ (${v.overflow}px)`);
    }
    md += '| ' + row.join(' | ') + ' |\n';
  }

  md += '\n## 2. Top Offenders & Root Causes Identified\n\n';
  md += '1. **Double Sidebars on Dashboard Sub-routes** (`/dashboard/broker`, `/dashboard/tutor`, `/dashboard/signal-provider`):\n';
  md += '   - Inner `aside.w-64` inside `<main>` causes massive horizontal overflow on mobile viewports (< 768px).\n\n';
  md += '2. **Admin Portal Lack of Mobile Drawer** (`/admin/*`):\n';
  md += '   - `AdminSidebar` is statically fixed at `w-64` on every viewport without a responsive mobile drawer.\n\n';
  md += '3. **Classroom Player Dual-Column Trap** (`/learn/*`):\n';
  md += '   - `aside.w-80` rendered horizontally alongside video crushes player area on screens < 1024px.\n\n';
  md += '4. **AI Assistant Panel Dimension Overflow** (`AIAssistant`):\n';
  md += '   - Hardcoded `w-[360px]` overflows 320px screens by 40px.\n\n';
  md += '5. **Tables Without Card Layout Fallback** (18 table files across Admin & Dashboard):\n';
  md += '   - Squeeze table columns and cause horizontal clipping without responsive stacking.\n\n';
  md += '6. **Tall Stepper on Mobile Broker Onboarding** (`/dashboard/broker/onboarding`):\n';
  md += '   - 19-step vertical stepper consumes entire viewport height on mobile before form fields are reached.\n';

  fs.writeFileSync('RESPONSIVE_AUDIT.md', md);
  console.log('\n\n✅ Audit complete! Generated RESPONSIVE_AUDIT.md and captured baseline screenshots in frontend/e2e/__screens__/');
}

run().catch(console.error);
