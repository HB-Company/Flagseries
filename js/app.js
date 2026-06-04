const products=[
 {id:'germany',name:'Germany Box',country:'Deutschland',flag:'🇩🇪',code:'GER',img:'assets/images/716d3da8-e18d-46c8-8196-9496c499fffb.png'},
 {id:'spain',name:'Spanien Box',country:'Spanien',flag:'🇪🇸',code:'ESP',img:'assets/images/06b6693d-8ce7-42c8-8196-9496c499fffb.png'},
 {id:'turkey',name:'Türkei Box',country:'Türkei',flag:'🇹🇷',code:'TUR',img:'assets/images/a6be8bbc-bb4c-4457-b2e1-4badbfb9e2d6.png'},
 {id:'brazil',name:'Brazil Box',country:'Brasilien',flag:'🇧🇷',code:'BRA',img:'assets/images/c0c52d3f-4636-4a0d-804d-653c0049aee1.png'},
 {id:'morocco',name:'Marokko Box',country:'Marokko',flag:'🇲🇦',code:'MAR',img:'assets/images/d250807c-a693-442f-86b3-e5794383e08e.png'}
];
const BOX_PRICE=39;
const fmt=n=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(n);

let grid, variant, qty, mainImage, heroImageBox, paymentStatus, editionBadge=null, currentSlideIndex=0, slideTimer=null;

function setStatus(msg,type='note'){
 if(!paymentStatus)return;
 paymentStatus.textContent=msg;
 paymentStatus.className=`note ${type}`;
}
function renderProducts(){
 products.forEach((p,i)=>{
  variant?.insertAdjacentHTML('beforeend',`<option value="${p.id}">${p.name}</option>`);
  grid?.insertAdjacentHTML('beforeend',`<article class="product-card ${i===0?'active':''}" data-id="${p.id}"><img src="${p.img}" alt="${p.name}"><div><h3>${p.name}</h3><p>50 Stück · Code ${p.code}</p></div></article>`);
 });
}
function updateEditionBadge(p,animate=true){
 if(!editionBadge)return;
 if(animate)editionBadge.classList.add('is-changing');
 setTimeout(()=>{editionBadge.textContent=`${p.flag} ${p.country} Edition`;editionBadge.classList.remove('is-changing');},animate?220:0);
}
function setHeroProduct(id,animate=true){
 const p=products.find(x=>x.id===id); if(!p)return;
 currentSlideIndex=products.findIndex(x=>x.id===id);
 if(variant) variant.value=id;
 if(mainImage){
  if(animate){
   mainImage.classList.add('is-changing'); updateEditionBadge(p,true);
   setTimeout(()=>{mainImage.src=p.img; mainImage.alt=`FLAG SERIES ${p.name}`; mainImage.classList.remove('is-changing'); mainImage.classList.add('is-entering');},280);
   setTimeout(()=>mainImage.classList.remove('is-entering'),820);
  } else { mainImage.src=p.img; mainImage.alt=`FLAG SERIES ${p.name}`; updateEditionBadge(p,false); }
 }
 document.querySelectorAll('.product-card').forEach(c=>c.classList.toggle('active',c.dataset.id===id));
 document.querySelectorAll('.slider-dot').forEach(d=>d.classList.toggle('active',d.dataset.id===id));
}
function selectProduct(id){setHeroProduct(id,true);restartSlider();}
function nextSlide(){const next=(currentSlideIndex+1)%products.length;setHeroProduct(products[next].id,true);}
function restartSlider(){clearInterval(slideTimer);slideTimer=setInterval(nextSlide,2800);}
function renderSliderDots(){
 if(!heroImageBox)return;
 editionBadge=document.createElement('div'); editionBadge.className='edition-badge'; editionBadge.textContent=`${products[0].flag} ${products[0].country} Edition`; heroImageBox.appendChild(editionBadge);
 const dots=document.createElement('div'); dots.className='slider-dots';
 dots.innerHTML=products.map((p,i)=>`<button class="slider-dot ${i===0?'active':''}" type="button" data-id="${p.id}" aria-label="${p.name} anzeigen"></button>`).join('');
 heroImageBox.appendChild(dots);
 dots.addEventListener('click',e=>{const dot=e.target.closest('.slider-dot'); if(dot)selectProduct(dot.dataset.id);});
}
function calcTotals(){
 const q=Math.max(1,Number(qty?.value)||1); if(qty)qty.value=q;
 const subtotal=q*BOX_PRICE; const discount=q>=10?subtotal*.10:0; const total=subtotal-discount;
 return {qty:q, subtotal, discount, total};
}
function updatePrice(){
 const t=calcTotals();
 document.querySelector('#subtotal').textContent=fmt(t.subtotal);
 document.querySelector('#discount').textContent='-'+fmt(t.discount);
 document.querySelector('#total').textContent=fmt(t.total);
}
function checkout(method){
 const p=products.find(x=>x.id===variant.value); const t=calcTotals();
 const subject=encodeURIComponent(`Bestellung FLAG SERIES ${p.name}`);
 const body=encodeURIComponent(`Hallo FLAG SERIES Team,\n\nich möchte bestellen:\nEdition: ${p.name}\nMenge: ${t.qty} Box(en)\nGesamt: ${fmt(t.total)}\nZahlungsart: ${method}\n\nName:\nAdresse:\nTelefon:\n`);
 window.location.href=`mailto:info@flagseries.de?subject=${subject}&body=${body}`;
}
async function postJSON(url,data){
 let res, text;
 try{
  res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
  text=await res.text();
 }catch(e){
  throw new Error('Server/API nicht erreichbar. Auf STRATO prüfen: Liegt der Ordner api/ neben index.html? Läuft die Seite über https://flagseries.de und nicht lokal per Datei?');
 }
 let json;
 try{ json=JSON.parse(text); }catch(e){ throw new Error('Server antwortet nicht mit JSON. Wahrscheinlich PHP-Fehler oder falscher Pfad: '+text.slice(0,140)); }
 if(!res.ok || json.error){
  const detail=json.detail ? ' · '+(typeof json.detail==='string'?json.detail:JSON.stringify(json.detail).slice(0,180)) : '';
  throw new Error((json.error || 'Serverfehler') + detail);
 }
 return json;
}
function currentOrderPayload(){
 const t=calcTotals(); const p=products.find(x=>x.id===variant.value) || products[0];
 return {variant:p.id, qty:t.qty};
}
function renderPayPal(){
 const container=document.querySelector('#paypal-button-container');
 if(!container) return;
 container.innerHTML='';
 if(!window.paypal){
  setStatus('PayPal SDK konnte nicht geladen werden. Prüfe Client-ID, Internet, Werbeblocker und ob die Seite über HTTPS läuft.','error');
  return;
 }
 paypal.Buttons({
  style:{layout:'vertical',color:'gold',shape:'rect',label:'paypal'},
  createOrder: async function(){
   setStatus('PayPal Zahlung wird vorbereitet ...');
   const data=await postJSON('api/create-paypal-order.php',currentOrderPayload());
   if(!data.id) throw new Error('PayPal hat keine Order-ID zurückgegeben.');
   return data.id;
  },
  onApprove: async function(data){
   setStatus('Zahlung wird bestätigt ...');
   const result=await postJSON('api/capture-paypal-order.php',{orderID:data.orderID, ...currentOrderPayload()});
   const tx=result.transaction_id ? ` Transaktion: ${result.transaction_id}` : '';
   setStatus(`✅ Zahlung erfolgreich. Vielen Dank!${tx}`,'success');
  },
  onCancel: function(){ setStatus('PayPal Zahlung wurde abgebrochen.'); },
  onError: function(err){ console.error('PayPal error',err); setStatus(`PayPal Fehler: ${err.message || 'Zahlung konnte nicht verarbeitet werden.'}`,'error'); }
 }).render('#paypal-button-container').then(()=>{
   setStatus('PayPal ist bereit. Wähle Edition und Menge, dann bezahlen.','success');
 }).catch(err=>{
   console.error(err); setStatus('PayPal Button konnte nicht gerendert werden: '+(err.message||err),'error');
 });
}
function init(){
 grid=document.querySelector('#productGrid'); variant=document.querySelector('#variant'); qty=document.querySelector('#qty'); mainImage=document.querySelector('#mainProductImage'); heroImageBox=document.querySelector('.hero-image'); paymentStatus=document.querySelector('#paymentStatus');
 renderProducts(); renderSliderDots(); updatePrice(); restartSlider();
 grid?.addEventListener('click',e=>{const card=e.target.closest('.product-card'); if(card)selectProduct(card.dataset.id);});
 variant?.addEventListener('change',e=>selectProduct(e.target.value));
 qty?.addEventListener('input',updatePrice);
 document.querySelector('#bankBtn')?.addEventListener('click',()=>checkout('Banküberweisung'));
 renderPayPal();
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
