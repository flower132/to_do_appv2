import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });

async function screenshot(page, name) {
  await page.screenshot({ path: `/Users/temp/my_first_project/to_do_app_v2/verify-mobile-${name}.png`, fullPage: false });
}

// ========================
// Desktop verification
// ========================
const desktopContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const desktopPage = await desktopContext.newPage();

await desktopPage.goto('http://localhost:8080');
await desktopPage.evaluate(() => localStorage.clear());
await desktopPage.reload();
await desktopPage.waitForTimeout(300);

// 1. Desktop: sidebar should be visible, mobile elements hidden
const sidebarVisible = await desktopPage.locator('.sidebar').isVisible();
const mobileHeaderHidden = await desktopPage.locator('.mobile-header').isHidden();
const mobileTabBarHidden = await desktopPage.locator('.mobile-tab-bar').isHidden();
const fabHidden = await desktopPage.locator('.fab-button').isHidden();

console.log('Desktop sidebar visible:', sidebarVisible);
console.log('Desktop mobile-header hidden:', mobileHeaderHidden);
console.log('Desktop mobile-tab-bar hidden:', mobileTabBarHidden);
console.log('Desktop FAB hidden:', fabHidden);

if (!sidebarVisible || !mobileHeaderHidden || !mobileTabBarHidden || !fabHidden) {
  console.error('Desktop layout check failed');
  await browser.close();
  process.exit(1);
}

await screenshot(desktopPage, '01-desktop-layout');

// 2. Desktop: create a todo
await desktopPage.fill('#todo-title', 'Desktop Test Todo');
await desktopPage.fill('#todo-due-date', '2026-05-25');
await desktopPage.click('button[type="submit"]');
await desktopPage.waitForTimeout(500);

const todoItems = await desktopPage.locator('.todo-item').count();
console.log('Desktop todo items:', todoItems);
if (todoItems !== 1) {
  console.error('Expected 1 todo on desktop, got', todoItems);
  await browser.close();
  process.exit(1);
}

// 3. Desktop: navigate to Calendar
await desktopPage.click('button[data-page="calendar"]');
await desktopPage.waitForTimeout(300);
await screenshot(desktopPage, '02-desktop-calendar');

const calendarWidget = await desktopPage.locator('.calendar-widget').isVisible();
console.log('Desktop calendar visible:', calendarWidget);
if (!calendarWidget) {
  console.error('Desktop calendar not visible');
  await browser.close();
  process.exit(1);
}

// 4. Desktop: navigate to History
await desktopPage.click('button[data-page="history"]');
await desktopPage.waitForTimeout(300);
await screenshot(desktopPage, '03-desktop-history');

const historyEmpty = await desktopPage.locator('.history-item, .empty-state').count();
console.log('Desktop history elements:', historyEmpty);
if (historyEmpty === 0) {
  console.error('Desktop history page empty');
  await browser.close();
  process.exit(1);
}

await desktopContext.close();

// ========================
// Mobile verification
// ========================
const mobileContext = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 });
const mobilePage = await mobileContext.newPage();

await mobilePage.goto('http://localhost:8080');
await mobilePage.evaluate(() => localStorage.clear());
await mobilePage.reload();
await mobilePage.waitForTimeout(300);

// 5. Mobile: sidebar hidden, mobile elements visible
const mobileSidebarHidden = await mobilePage.locator('.sidebar').isHidden();
const mobileHeaderVisible = await mobilePage.locator('.mobile-header').isVisible();
const mobileTabBarVisible = await mobilePage.locator('.mobile-tab-bar').isVisible();
const fabVisible = await mobilePage.locator('.fab-button').isVisible();

console.log('Mobile sidebar hidden:', mobileSidebarHidden);
console.log('Mobile mobile-header visible:', mobileHeaderVisible);
console.log('Mobile mobile-tab-bar visible:', mobileTabBarVisible);
console.log('Mobile FAB visible:', fabVisible);

if (!mobileSidebarHidden || !mobileHeaderVisible || !mobileTabBarVisible || !fabVisible) {
  console.error('Mobile layout check failed');
  await browser.close();
  process.exit(1);
}

await screenshot(mobilePage, '04-mobile-layout');

// 6. Mobile: bottom tab switch to Calendar
await mobilePage.click('.mobile-tab[data-page="calendar"]');
await mobilePage.waitForTimeout(400); // wait for animation
await screenshot(mobilePage, '05-mobile-calendar');

const mobileCalendarVisible = await mobilePage.locator('.calendar-widget').isVisible();
console.log('Mobile calendar visible after tab switch:', mobileCalendarVisible);
if (!mobileCalendarVisible) {
  console.error('Mobile calendar not visible after tab switch');
  await browser.close();
  process.exit(1);
}

const calendarTabActive = await mobilePage.locator('.mobile-tab[data-page="calendar"]').evaluate(el => el.classList.contains('is-active'));
console.log('Mobile calendar tab active:', calendarTabActive);
if (!calendarTabActive) {
  console.error('Mobile calendar tab not active');
  await browser.close();
  process.exit(1);
}

// 7. Mobile: bottom tab switch to History
await mobilePage.click('.mobile-tab[data-page="history"]');
await mobilePage.waitForTimeout(400);
await screenshot(mobilePage, '06-mobile-history');

const mobileHistoryVisible = await mobilePage.locator('.history-list, .empty-state').count();
console.log('Mobile history elements after tab switch:', mobileHistoryVisible);
if (mobileHistoryVisible === 0) {
  console.error('Mobile history not visible after tab switch');
  await browser.close();
  process.exit(1);
}

// 8. Mobile: FAB opens quick add panel
await mobilePage.click('.fab-button');
await mobilePage.waitForTimeout(300);
await screenshot(mobilePage, '07-mobile-fab-open');

const quickAddOpen = await mobilePage.locator('.quick-add-panel').evaluate(el => el.classList.contains('is-open'));
console.log('Quick add panel open after FAB click:', quickAddOpen);
if (!quickAddOpen) {
  console.error('Quick add panel not open after FAB click');
  await browser.close();
  process.exit(1);
}

// 9. Mobile: quick add creates todo
await mobilePage.fill('#quick-add-form input[name="title"]', 'Mobile Quick Add Todo');
await mobilePage.click('#quick-add-form button[type="submit"]');
await mobilePage.waitForTimeout(400);
await screenshot(mobilePage, '08-mobile-after-quick-add');

const quickAddClosed = await mobilePage.locator('.quick-add-panel').evaluate(el => !el.classList.contains('is-open'));
console.log('Quick add panel closed after submit:', quickAddClosed);
if (!quickAddClosed) {
  console.error('Quick add panel not closed after submit');
  await browser.close();
  process.exit(1);
}

// Switch back to Todo to verify
await mobilePage.click('.mobile-tab[data-page="todo"]');
await mobilePage.waitForTimeout(400);
await screenshot(mobilePage, '09-mobile-todo-after-quick-add');

const mobileTodoItems = await mobilePage.locator('.todo-item').count();
console.log('Mobile todo items after quick add:', mobileTodoItems);
if (mobileTodoItems !== 1) {
  console.error('Expected 1 todo after quick add, got', mobileTodoItems);
  await browser.close();
  process.exit(1);
}

// 10. Mobile: header title updates
const headerTitle = await mobilePage.locator('.mobile-header__title').textContent();
console.log('Mobile header title:', headerTitle);
if (headerTitle !== 'Todo') {
  console.error('Expected header title "Todo", got', headerTitle);
  await browser.close();
  process.exit(1);
}

// 11. Mobile: tab center (+) opens quick add
await mobilePage.click('.mobile-tab--center');
await mobilePage.waitForTimeout(300);
const centerQuickAddOpen = await mobilePage.locator('.quick-add-panel').evaluate(el => el.classList.contains('is-open'));
console.log('Quick add panel open after center tab click:', centerQuickAddOpen);
if (!centerQuickAddOpen) {
  console.error('Quick add panel not open after center tab click');
  await browser.close();
  process.exit(1);
}
await mobilePage.click('#quick-add-close');
await mobilePage.waitForTimeout(200);

// 12. Mobile: settings page
await mobilePage.click('.mobile-tab[data-page="settings"]');
await mobilePage.waitForTimeout(400);
await screenshot(mobilePage, '10-mobile-settings');

const settingsVisible = await mobilePage.locator('.settings-card').isVisible();
console.log('Mobile settings visible:', settingsVisible);
if (!settingsVisible) {
  console.error('Mobile settings not visible');
  await browser.close();
  process.exit(1);
}

const settingsTitle = await mobilePage.locator('.mobile-header__title').textContent();
console.log('Mobile settings header title:', settingsTitle);
if (settingsTitle !== 'Settings') {
  console.error('Expected header title "Settings", got', settingsTitle);
  await browser.close();
  process.exit(1);
}

await mobileContext.close();
await browser.close();

console.log('All mobile-first verifications passed.');
