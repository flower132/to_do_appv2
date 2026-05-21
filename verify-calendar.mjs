import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

async function screenshot(name) {
  await page.screenshot({ path: `/Users/temp/my_first_project/to_do_app_v2/verify-${name}.png`, fullPage: false });
}

// 1. Open app with clean storage
await page.goto('http://localhost:8765');
await page.evaluate(() => localStorage.clear());
await page.reload();

// 2. Create two todos with due date
await page.fill('#todo-title', 'Test Complete Todo');
await page.fill('#todo-due-date', '2026-05-25');
await page.click('button[type="submit"]');

await page.fill('#todo-title', 'Test Delete Todo');
await page.fill('#todo-due-date', '2026-05-25');
await page.click('button[type="submit"]');

await page.waitForTimeout(200);
await screenshot('01-todos-created');

// 3. Go to Calendar
await page.click('button[data-page="calendar"]');
await page.waitForTimeout(200);
await screenshot('02-calendar-page');

// 4. Click the date cell (May 25)
const cell = await page.locator('.calendar-cell[data-date="2026-05-25"]');
await cell.click();
await page.waitForTimeout(200);
await screenshot('03-date-selected');

// Verify both todos are in panel
const panelItems = await page.locator('.calendar-selected-panel__item').count();
console.log('Panel items before actions:', panelItems);
if (panelItems !== 2) {
  console.error('Expected 2 todos in panel, got', panelItems);
  await browser.close();
  process.exit(1);
}

// 5. Click complete on first todo
const completeBtn = await page.locator('button[data-action="complete"]').first();
await completeBtn.click();
await page.waitForTimeout(300);
await screenshot('04-after-complete');

// Verify one todo remains in panel
const remainingAfterComplete = await page.locator('.calendar-selected-panel__item').count();
console.log('Panel items after complete:', remainingAfterComplete);
if (remainingAfterComplete !== 1) {
  console.error('Expected 1 todo in panel after complete, got', remainingAfterComplete);
  await browser.close();
  process.exit(1);
}

// 6. Go to History and verify completed todo is there
await page.click('button[data-page="history"]');
await page.waitForTimeout(200);
await screenshot('05-history-after-complete');

const historyItems = await page.locator('.history-item').count();
console.log('History items after complete:', historyItems);
if (historyItems !== 1) {
  console.error('Expected 1 todo in history, got', historyItems);
  await browser.close();
  process.exit(1);
}

// 7. Go back to Calendar and delete the second todo
await page.click('button[data-page="calendar"]');
await page.waitForTimeout(200);

const cellAgain = await page.locator('.calendar-cell[data-date="2026-05-25"]');
await cellAgain.click();
await page.waitForTimeout(200);
await screenshot('06-back-to-calendar');

const deleteBtn = await page.locator('button[data-action="delete"]').first();
await deleteBtn.click();
await page.waitForTimeout(300);
await screenshot('07-after-delete');

// Verify panel is empty
const remainingAfterDelete = await page.locator('.calendar-selected-panel__item').count();
console.log('Panel items after delete:', remainingAfterDelete);
if (remainingAfterDelete !== 0) {
  console.error('Expected 0 todos in panel after delete, got', remainingAfterDelete);
  await browser.close();
  process.exit(1);
}

// Also verify localStorage persistence: reload and check calendar
await page.reload();
await page.waitForTimeout(200);
await page.click('button[data-page="calendar"]');
await page.waitForTimeout(200);
const cellReload = await page.locator('.calendar-cell[data-date="2026-05-25"]');
await cellReload.click();
await page.waitForTimeout(200);
await screenshot('08-after-reload');

const afterReload = await page.locator('.calendar-selected-panel__item').count();
console.log('Panel items after reload:', afterReload);
if (afterReload !== 0) {
  console.error('Expected 0 todos in panel after reload, got', afterReload);
  await browser.close();
  process.exit(1);
}

console.log('All verifications passed.');
await browser.close();
