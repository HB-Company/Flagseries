const products = [
  { id:'germany', name:'Germany Box', country:'Deutschland', flag:'🇩🇪', code:'GER', img:'assets/images/716d3da8-e18d-46c8-8196-9496c499fffb.png' },
  { id:'spain', name:'Spanien Box', country:'Spanien', flag:'🇪🇸', code:'ESP', img:'assets/images/06b6693d-8ce7-42c8-8d93-9911a0f3f246.png' },
  { id:'turkey', name:'Türkei Box', country:'Türkei', flag:'🇹🇷', code:'TUR', img:'assets/images/a6be8bbc-bb4c-4457-b2e1-4badbfb9e2d6.png' },
  { id:'brazil', name:'Brazil Box', country:'Brasilien', flag:'🇧🇷', code:'BRA', img:'assets/images/c0c52d3f-4636-4a0d-804d-653c0049aee1.png' },
  { id:'morocco', name:'Marokko Box', country:'Marokko', flag:'🇲🇦', code:'MAR', img:'assets/images/d250807c-a693-442f-86b3-e5794383e08e.png' }
];

const BOX_PRICE = 39;
const fmt = n => new Intl.NumberFormat('de-DE', { style:'currency', currency:'EUR' }).format(n);

const grid = document.querySelector('#productGrid');
const variant = document.querySelector('#variant');
const qty = document.querySelector('#qty');
const mainImage = document.querySelector('#mainProductImage');
const heroImageBox = document.querySelector('.hero-image');
const paymentStatus = document.querySelector('#paymentStatus');
let editionBadge = null;
let currentSlideIndex = 0;
let slideTimer = null;
let paypalRendered = false;

function setStatus(message, type = '') {
  if (!paymentStatus) return;
  paymentStatus.textContent = message;
  paymentStatus.className = `note ${type}`.trim();
}

function totals() {
  const q = Math.max(1, Number(qty?.value) || 1);
  if (qty) qty.value = q;
  const subtotal = q * BOX_PRICE;
  const discount = q >= 10 ? subtotal * 0.10 : 0;
  const total = +(subtotal - discount).toFixed(2);
  return { q, subtotal, discount, total };
}

function selectedProduct() {
  return products.find(p => p.id === variant?.value) || products[0];
}

function renderProducts() {
  products.forEach((p, i) => {
    variant?.insertAdjacentHTML('beforeend', `<option value="${p.id}">${p.name}</option>`);
    grid?.insertAdjacentHTML('beforeend', `<article class="product-card ${i===0?'active':''}" data-id="${p.id}"><img src="${p.img}" alt="${p.name}"><div><h3>${p.name}</h3><p>50 Stück · Code ${p.code}</p></div></article>`);
  });
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
  if (variant) variant.value = id;
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

function updatePrice() {
  const t = totals();
  document.querySelector('#subtotal').textContent = fmt(t.subtotal);
  document.querySelector('#discount').textContent = '-' + fmt(t.discount);
  document.querySelector('#total').textContent = fmt(t.total);
}

function orderText(method) {
  const p = selectedProduct();
  const t = totals();
  return `Hallo FLAG SERIES Team,\n\nich möchte bestellen:\nEdition: ${p.name}\nMenge: ${t.q} Box(en)\nGesamt: ${fmt(t.total)}\nZahlungsart: ${method}\n\nName:\nAdresse:\nTelefon:\n`;
}

function checkoutBank() {
  const p = selectedProduct();
  window.location.href = `mailto:info@flagseries.de?subject=${encodeURIComponent('Bestellung FLAG SERIES ' + p.name)}&body=${encodeURIComponent(orderText('Banküberweisung'))}`;
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

    createOrder: function(data, actions) {
      const p = selectedProduct();
      const t = totals();
      setStatus('PayPal Fenster wird geöffnet ...');
      return actions.order.create({
        intent: 'CAPTURE',
        purchase_units: [{
          description: `FLAG SERIES ${p.name} - ${t.q} Box(en)`,
          amount: {
            currency_code: 'EUR',
            value: t.total.toFixed(2),
            breakdown: {
              item_total: { currency_code: 'EUR', value: t.subtotal.toFixed(2) },
              discount: { currency_code: 'EUR', value: t.discount.toFixed(2) }
            }
          },
          items: [{
            name: `FLAG SERIES ${p.name}`,
            unit_amount: { currency_code: 'EUR', value: BOX_PRICE.toFixed(2) },
            quantity: String(t.q),
            category: 'PHYSICAL_GOODS'
          }]
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
        console.log('PayPal Zahlung erfolgreich:', details);
      });
    },

    onCancel: function() { setStatus('PayPal Zahlung wurde abgebrochen.'); },

    onError: function(err) {
      console.error('PayPal Fehler:', err);
      setStatus('PayPal Fehler: Bitte prüfe, ob die Client-ID LIVE ist und dein PayPal Business-Konto aktiv ist.', 'error');
    }
  }).render('#paypal-button-container').then(() => {
    paypalRendered = true;
    setStatus('PayPal ist bereit.');
  }).catch(err => {
    console.error(err);
    setStatus('PayPal Button konnte nicht angezeigt werden: ' + (err.message || err), 'error');
  });
}

function init() {
  renderProducts();
  renderSliderDots();
  updatePrice();
  restartSlider();
  grid?.addEventListener('click', e => {
    const card = e.target.closest('.product-card');
    if (card) selectProduct(card.dataset.id);
  });
  variant?.addEventListener('change', e => selectProduct(e.target.value));
  qty?.addEventListener('input', updatePrice);
  document.querySelector('#bankBtn')?.addEventListener('click', checkoutBank);
  renderPayPal();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
