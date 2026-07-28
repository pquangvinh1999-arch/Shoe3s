import { describe, expect, it } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const pagePath = path.resolve(__dirname, '../index.html');
const html = fs.readFileSync(pagePath, 'utf-8');
const htmlWithoutExternalScripts = html.replace(/<script[^>]+src="[^"]*"><\/script>/g, '');

async function createDom() {
  let orderApiPayload = null;
  let telegramPayload = null;

  const dom = new JSDOM(htmlWithoutExternalScripts, {
    url: `${pathToFileURL(pagePath).toString()}?page=order`,
    resources: 'usable',
    runScripts: 'dangerously',
    beforeParse(window) {
      window.alert = () => {};
      window.fetch = async (url, options = {}) => {
        if (String(url).includes('/api/orders') && options.body) {
          orderApiPayload = JSON.parse(options.body.toString());
          return {
            ok: true,
            json: async () => ({
              ok: true,
              order_id: 'order-123',
              status: 'Chờ thanh toán',
              quote: { total_vnd: 69000, items: [] },
            }),
          };
        }
        if (String(url).includes('/api/telegram') && options.body) {
          telegramPayload = JSON.parse(options.body.toString());
          return { ok: true, json: async () => ({}) };
        }
        return { ok: true, json: async () => ({}), text: async () => '' };
      };
      window.supabase = {
        createClient: () => ({
          auth: {
            getSession: async () => ({ data: { session: null } }),
            signInWithPassword: async () => ({ data: null, error: null }),
            signOut: async () => null,
          },
          from: (table) => ({
            insert: async (rows) => {
              if (table === 'orders') insertedOrderPayload = Array.isArray(rows) ? rows[0] : rows;
              return { error: null };
            },
            select: async () => ({ data: [] }),
          }),
        }),
      };
    },
  });

  const serviceCatalogModule = await import(pathToFileURL(path.resolve(__dirname, '../js/service-catalog.js')).href);
  const orderSchemaModule = await import(pathToFileURL(path.resolve(__dirname, '../js/order-schema.js')).href);
  Object.assign(dom.window, {
    serviceCatalog: serviceCatalogModule.serviceCatalog,
    getServiceCatalog: serviceCatalogModule.getServiceCatalog,
    getServiceByName: serviceCatalogModule.getServiceByName,
    getServiceById: serviceCatalogModule.getServiceById,
    resolveSelectedItems: serviceCatalogModule.resolveSelectedItems,
    calculateTotal: serviceCatalogModule.calculateTotal,
    selectedNamesToLegacyServices: serviceCatalogModule.selectedNamesToLegacyServices,
    buildLegacyOrderData: orderSchemaModule.buildLegacyOrderData,
  });

  const appCode = fs.readFileSync(path.resolve(__dirname, '../js/app.js'), 'utf-8');
  const appScript = dom.window.document.createElement('script');
  appScript.type = 'text/javascript';
  appScript.textContent = appCode;
  dom.window.document.head.appendChild(appScript);

  await new Promise((resolve) => setTimeout(resolve, 300));
  return {
    dom,
    getOrderApiPayload: () => orderApiPayload,
    getTelegramPayload: () => telegramPayload,
  };
}

describe('P01-T01 E2E sample', () => {
  it('loads the landing page and can select a service card', async () => {
    const { dom } = await createDom();
    const document = dom.window.document;
    const firstServiceCard = document.querySelector('.service-card');
    expect(firstServiceCard).toBeTruthy();

    firstServiceCard?.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
    expect(firstServiceCard?.classList.contains('selected')).toBe(true);
  });

  it('shows the order form when valid customer info is entered', async () => {
    const { dom } = await createDom();
    const document = dom.window.document;
    const nameInput = document.getElementById('cus-name');
    const phoneInput = document.getElementById('cus-phone');
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');

    expect(nameInput).toBeTruthy();
    expect(phoneInput).toBeTruthy();
    expect(step1).toBeTruthy();
    expect(step2).toBeTruthy();

    if (nameInput && phoneInput) {
      nameInput.value = 'Test User';
      phoneInput.value = '0123456789';
    }

    const button = document.querySelector('button[onclick="toStep2()"]');
    expect(button).toBeTruthy();

    button?.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
    expect(step1?.classList.contains('hidden')).toBe(true);
    expect(step2?.classList.contains('hidden')).toBe(false);
  });

  it('completes checkout when a service is selected and order is submitted', async () => {
    const { dom, getOrderApiPayload, getTelegramPayload } = await createDom();
    const document = dom.window.document;
    const firstServiceCard = document.querySelector('.service-card');
    const nameInput = document.getElementById('cus-name');
    const phoneInput = document.getElementById('cus-phone');
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const successModal = document.getElementById('success-modal');

    expect(firstServiceCard).toBeTruthy();
    expect(nameInput).toBeTruthy();
    expect(phoneInput).toBeTruthy();
    expect(step1).toBeTruthy();
    expect(step2).toBeTruthy();
    expect(successModal).toBeTruthy();

    firstServiceCard?.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
    if (nameInput && phoneInput) {
      nameInput.value = 'Test User';
      phoneInput.value = '0123456789';
    }

    const continueButton = document.querySelector('button[onclick="toStep2()"]');
    expect(continueButton).toBeTruthy();
    continueButton?.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));

    const pickupAddressInput = document.getElementById('pickup-address');
    const noteInput = document.getElementById('order-note');
    const tokenInput = document.getElementById('turnstile-token');

    expect(pickupAddressInput).toBeTruthy();
    expect(noteInput).toBeTruthy();
    expect(tokenInput).toBeTruthy();

    if (pickupAddressInput) pickupAddressInput.value = '123 Nguyễn Văn Cừ, Quận 1';
    if (noteInput) noteInput.value = 'Giữ kỹ phần đế';
    if (tokenInput) tokenInput.value = 'test-token-123';

    const submitButton = document.querySelector('button[onclick="submitOrder()"]');
    expect(submitButton).toBeTruthy();
    submitButton?.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));

    await new Promise((resolve) => setTimeout(resolve, 50));

    const orderPayload = getOrderApiPayload();
    expect(orderPayload).toBeTruthy();
    expect(orderPayload.customer_name).toBe('Test User');
    expect(orderPayload.phone).toBe('0123456789');
    expect(orderPayload.service_ids).toEqual(['service-cleaning']);
    expect(orderPayload.pickup_address).toBe('123 Nguyễn Văn Cừ, Quận 1');
    expect(orderPayload.note).toBe('Giữ kỹ phần đế');
    expect(orderPayload.turnstile_token).toBe('test-token-123');
    expect(orderPayload.idempotency_key).toBeTruthy();

    const telegramPayload = getTelegramPayload();
    expect(telegramPayload).toBeNull();

    expect(successModal?.style.display).toBe('flex');
    expect(step1?.classList.contains('hidden')).toBe(true);
    expect(step2?.classList.contains('hidden')).toBe(false);
  });
});
