const products = [
  { id:'germany', name:'Germany Box', country:'Deutschland', flag:'🇩🇪', code:'GER', img:'assets/images/716d3da8-e18d-46c8-8196-9496c499fffb.png' },
  { id:'spain', name:'Spanien Box', country:'Spanien', flag:'🇪🇸', code:'ESP', img:'assets/images/06b6693d-8ce7-42c8-8d93-9911a0f3f246.png' },
  { id:'turkey', name:'Türkei Box', country:'Türkei', flag:'🇹🇷', code:'TUR', img:'assets/images/a6be8bbc-bb4c-4457-b2e1-4badbfb9e2d6.png' },
  { id:'brazil', name:'Brazil Box', country:'Brasilien', flag:'🇧🇷', code:'BRA', img:'assets/images/c0c52d3f-4636-4a0d-804d-653c0049aee1.png' },
  { id:'morocco', name:'Marokko Box', country:'Marokko', flag:'🇲🇦', code:'MAR', img:'assets/images/d250807c-a693-442f-86b3-e5794383e08e.png' }
];

const BOX_PRICE = 39;
const DISCOUNT_MIN_BOXES = 10;
const DISCOUNT_RATE = 0.10;
const fmt = n => new Intl.NumberFormat('de-DE', { style:'currency', currency:'EUR' }).format(n);

const grid = document.querySelector('#productGrid');
const multiVariantList = document.querySelector('#multiVariantList');
const mainImage = document.querySelector('#mainProductImage');
const heroImageBox = document.querySelector('.hero-image');
const paymentStatus = document.querySelector('#paymentStatus');
const cart = Object.fromEntries(products.map(p => [p.id, 0]));
let editionBadge = null;
let currentSlideIndex = 0;
let slideTimer = null;

function setStatus(message, type = '') {
  if (!paymentStatus) return;
  paymentStatus.textContent = message;
  paymentStatus.className = `note ${type}`.trim();
}

function getCartItems() {
  return products
    .map(p => ({ ...p, qty: Math.max(0, Number(cart[p.id]) || 0) }))
    .filter(item => item.qty > 0);
}

function totals() {
  const items = getCartItems();
  const totalBoxes = items.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = totalBoxes * BOX_PRICE;
  const discount = totalBoxes >= DISCOUNT_MIN_BOXES ? +(subtotal * DISCOUNT_RATE).toFixed(2) : 0;
  const total = +(subtotal - discount).toFixed(2);
  return { items, totalBoxes, subtotal, discount, total };
}

function renderProducts() {
  products.forEach((p, i) => {
    grid?.insertAdjacentHTML('beforeend', `
      <article class="product-card ${i===0?'active':''}" data-id="${p.id}">
        <img src="${p.img}" alt="${p.name}">
        <div>
          <h3>${p.name}</h3>
          <p>50 Stück · Code ${p.code}</p>
        </div>
      </article>`);
  });
}

function renderVariantControls() {
  if (!multiVariantList) return;
  multiVariantList.innerHTML = products.map(p => `
    <div class="variant-row" data-id="${p.id}">
      <button class="variant-info" type="button" aria-label="${p.name} anzeigen">
        <span class="variant-flag">${p.flag}</span>
        <span><strong>${p.country}</strong><small>${p.name} · 50 Stück</small></span>
      </button>
      <div class="qty-stepper" aria-label="Menge ${p.name}">
        <button type="button" class="qty-btn minus" data-id="${p.id}">−</button>
        <input class="qty-input" data-id="${p.id}" type="number" min="0" value="0" inputmode="numeric" aria-label="Anzahl ${p.name}">
        <button type="button" class="qty-btn plus" data-id="${p.id}">+</button>
      </div>
    </div>`).join('');
}

function updateEditionBadge(p, animate = true) {
  if (!editionBadge) return;
  if (animate) editionBadge.classList.add('is-changing');
  setTimeout(() => {
    editionBadge.textContent = `${p.flag} ${p.country} Edition`;
    editionBadge.classList.remove('is-changing');
  }, animate ? 220 : 0);
}

function setHeroProduct(id, animate = true) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  currentSlideIndex = products.findIndex(x => x.id === id);
  if (mainImage) {
    if (animate) {
      mainImage.classList.add('is-changing');
      updateEditionBadge(p, true);
      setTimeout(() => {
        mainImage.src = p.img;
        mainImage.alt = `FLAG SERIES ${p.name}`;
        mainImage.classList.remove('is-changing');
        mainImage.classList.add('is-entering');
      }, 280);
      setTimeout(() => mainImage.classList.remove('is-entering'), 820);
    } else {
      mainImage.src = p.img;
      mainImage.alt = `FLAG SERIES ${p.name}`;
      updateEditionBadge(p, false);
    }
  }
  document.querySelectorAll('.product-card').forEach(c => c.classList.toggle('active', c.dataset.id === id));
  document.querySelectorAll('.slider-dot').forEach(d => d.classList.toggle('active', d.dataset.id === id));
  document.querySelectorAll('.variant-row').forEach(r => r.classList.toggle('active', r.dataset.id === id));
}

function selectProduct(id) { setHeroProduct(id, true); restartSlider(); }
function nextSlide() { setHeroProduct(products[(currentSlideIndex + 1) % products.length].id, true); }
function restartSlider() { clearInterval(slideTimer); slideTimer = setInterval(nextSlide, 2800); }

function renderSliderDots() {
  if (!heroImageBox) return;
  editionBadge = document.createElement('div');
  editionBadge.className = 'edition-badge';
  editionBadge.textContent = `${products[0].flag} ${products[0].country} Edition`;
  heroImageBox.appendChild(editionBadge);
  const dots = document.createElement('div');
  dots.className = 'slider-dots';
  dots.innerHTML = products.map((p,i) => `<button class="slider-dot ${i===0?'active':''}" type="button" data-id="${p.id}" aria-label="${p.name} anzeigen"></button>`).join('');
  heroImageBox.appendChild(dots);
  dots.addEventListener('click', e => {
    const dot = e.target.closest('.slider-dot');
    if (dot) selectProduct(dot.dataset.id);
  });
}

function syncQtyInputs() {
  document.querySelectorAll('.qty-input').forEach(input => {
    const id = input.dataset.id;
    input.value = String(Math.max(0, Number(cart[id]) || 0));
  });
}

function updatePrice() {
  const t = totals();
  const totalBoxesEl = document.querySelector('#totalBoxes');
  const subtotalEl = document.querySelector('#subtotal');
  const discountEl = document.querySelector('#discount');
  const totalEl = document.querySelector('#total');
  const cartItemsEl = document.querySelector('#cartItems');
  const discountHint = document.querySelector('#discountHint');

  if (totalBoxesEl) totalBoxesEl.textContent = String(t.totalBoxes);
  if (subtotalEl) subtotalEl.textContent = fmt(t.subtotal);
  if (discountEl) discountEl.textContent = t.discount > 0 ? '-' + fmt(t.discount) : fmt(0);
  if (totalEl) totalEl.textContent = fmt(t.total);

  if (cartItemsEl) {
    cartItemsEl.innerHTML = t.items.length
      ? t.items.map(item => `<div><span>${item.flag} ${item.country}</span><strong>${item.qty} Box(en)</strong></div>`).join('')
      : 'Noch keine Box ausgewählt.';
  }

  if (discountHint) {
    if (t.totalBoxes >= DISCOUNT_MIN_BOXES) {
      discountHint.textContent = `🎉 Mengenrabatt aktiv: 10% Rabatt auf ${t.totalBoxes} Boxen.`;
      discountHint.className = 'note success';
    } else {
      const missing = DISCOUNT_MIN_BOXES - t.totalBoxes;
      discountHint.textContent = `Noch ${missing} Box(en) bis zum 10% Mengenrabatt.`;
      discountHint.className = 'note';
    }
  }
}

function setQty(id, value) {
  if (!products.some(p => p.id === id)) return;
  cart[id] = Math.max(0, Math.floor(Number(value) || 0));
  syncQtyInputs();
  updatePrice();
}

function changeQty(id, delta) {
  setQty(id, (Number(cart[id]) || 0) + delta);
  selectProduct(id);
}

function orderText(method) {
  const t = totals();
  const lines = t.items.map(item => `${item.qty}x ${item.name} (${item.country})`).join('\n');
  return `Hallo FLAG SERIES Team,\n\nich möchte bestellen:\n${lines || 'Keine Auswahl'}\n\nGesamt Boxen: ${t.totalBoxes}\nRabatt: ${fmt(t.discount)}\nGesamt: ${fmt(t.total)}\nZahlungsart: ${method}\n\nName:\nAdresse:\nTelefon:\n`;
}

function checkoutBank() {
  const t = totals();
  if (t.totalBoxes < 1) {
    setStatus('Bitte wähle mindestens eine Box aus.', 'error');
    return;
  }
  window.location.href = `mailto:info@flagseries.de?subject=${encodeURIComponent('Bestellung FLAG SERIES - ' + t.totalBoxes + ' Boxen')}&body=${encodeURIComponent(orderText('Banküberweisung'))}`;
}

function renderPayPal() {
  const container = document.querySelector('#paypal-button-container');
  if (!container) return;
  container.innerHTML = '';

  if (!window.paypal) {
    setStatus('PayPal konnte nicht geladen werden. Bitte Werbeblocker ausschalten und über https:// öffnen.', 'error');
    return;
  }

  paypal.Buttons({
    style: { layout:'vertical', color:'gold', shape:'rect', label:'paypal' },

    onClick: function(data, actions) {
      const t = totals();
      if (t.totalBoxes < 1) {
        setStatus('Bitte wähle mindestens eine Box aus.', 'error');
        return actions.reject();
      }
      return actions.resolve();
    },

    createOrder: function(data, actions) {
      const t = totals();
      const description = t.items.map(item => `${item.qty}x ${item.country}`).join(', ');
      setStatus('PayPal Fenster wird geöffnet ...');

      return actions.order.create({
        intent: 'CAPTURE',
        purchase_units: [{
          description: `FLAG SERIES Boxen: ${description}`,
          amount: {
            currency_code: 'EUR',
            value: t.total.toFixed(2),
            breakdown: {
              item_total: { currency_code: 'EUR', value: t.subtotal.toFixed(2) },
              discount: { currency_code: 'EUR', value: t.discount.toFixed(2) }
            }
          },
          items: t.items.map(item => ({
            name: `FLAG SERIES ${item.name}`,
            description: `${item.country} Edition · 50 Feuerzeuge pro Box`,
            sku: item.code,
            unit_amount: { currency_code: 'EUR', value: BOX_PRICE.toFixed(2) },
            quantity: String(item.qty),
            category: 'PHYSICAL_GOODS'
          }))
        }],
        application_context: {
          brand_name: 'FLAG SERIES',
          shipping_preference: 'GET_FROM_FILE',
          user_action: 'PAY_NOW'
        }
      });
    },

    onApprove: function(data, actions) {
      setStatus('Zahlung wird bestätigt ...');
      return actions.order.capture().then(function(details) {
        const name = details?.payer?.name?.given_name || 'Kunde';
        setStatus(`✅ Zahlung erfolgreich. Danke, ${name}! Bestellnummer: ${data.orderID}`, 'success');
        console.log('PayPal Zahlung erfolgreich:', details, totals());
      });
    },

    onCancel: function() { setStatus('PayPal Zahlung wurde abgebrochen.'); },

    onError: function(err) {
      console.error('PayPal Fehler:', err);
      setStatus('PayPal Fehler: Bitte prüfe Client-ID, Konto und Browser-Konsole.', 'error');
    }
  }).render('#paypal-button-container').then(() => {
    setStatus('PayPal ist bereit. Bitte Boxen auswählen.');
  }).catch(err => {
    console.error(err);
    setStatus('PayPal Button konnte nicht angezeigt werden: ' + (err.message || err), 'error');
  });
}

function init() {
  renderProducts();
  renderVariantControls();
  renderSliderDots();
  updatePrice();
  restartSlider();

  grid?.addEventListener('click', e => {
    const card = e.target.closest('.product-card');
    if (card) selectProduct(card.dataset.id);
  });

  multiVariantList?.addEventListener('click', e => {
    const info = e.target.closest('.variant-info');
    if (info) {
      const row = info.closest('.variant-row');
      if (row) selectProduct(row.dataset.id);
      return;
    }
    const plus = e.target.closest('.qty-btn.plus');
    const minus = e.target.closest('.qty-btn.minus');
    if (plus) changeQty(plus.dataset.id, 1);
    if (minus) changeQty(minus.dataset.id, -1);
  });

  multiVariantList?.addEventListener('input', e => {
    const input = e.target.closest('.qty-input');
    if (input) setQty(input.dataset.id, input.value);
  });

  document.querySelector('#bankBtn')?.addEventListener('click', checkoutBank);
  renderPayPal();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
