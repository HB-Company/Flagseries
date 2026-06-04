const products=[
 {id:'germany',name:'Germany Box',country:'Deutschland',code:'GER',img:'assets/images/716d3da8-e18d-46c8-8196-9496c499fffb.png'},
 {id:'spain',name:'Spanien Box',country:'Spanien',code:'ESP',img:'assets/images/06b6693d-8ce7-42c8-8d93-9911a0f3f246.png'},
 {id:'turkey',name:'Türkei Box',country:'Türkei',code:'TUR',img:'assets/images/a6be8bbc-bb4c-4457-b2e1-4badbfb9e2d6.png'},
 {id:'brazil',name:'Brazil Box',country:'Brasilien',code:'BRA',img:'assets/images/c0c52d3f-4636-4a0d-804d-653c0049aee1.png'},
 {id:'morocco',name:'Marokko Box',country:'Marokko',code:'MAR',img:'assets/images/d250807c-a693-442f-86b3-e5794383e08e.png'}
];
const BOX_PRICE=39;
const grid=document.querySelector('#productGrid');
const variant=document.querySelector('#variant');
const qty=document.querySelector('#qty');
const mainImage=document.querySelector('#mainProductImage');
const fmt=n=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(n);
function renderProducts(){products.forEach((p,i)=>{variant.insertAdjacentHTML('beforeend',`<option value="${p.id}">${p.name}</option>`);grid.insertAdjacentHTML('beforeend',`<article class="product-card ${i===0?'active':''}" data-id="${p.id}"><img src="${p.img}" alt="${p.name}"><div><h3>${p.name}</h3><p>50 Stück · Code ${p.code}</p></div></article>`);});}
function selectProduct(id){const p=products.find(x=>x.id===id);if(!p)return;variant.value=id;mainImage.src=p.img;document.querySelectorAll('.product-card').forEach(c=>c.classList.toggle('active',c.dataset.id===id));}
function updatePrice(){const q=Math.max(1,Number(qty.value)||1);qty.value=q;const subtotal=q*BOX_PRICE;const discount=q>=10?subtotal*.10:0;document.querySelector('#subtotal').textContent=fmt(subtotal);document.querySelector('#discount').textContent='-'+fmt(discount);document.querySelector('#total').textContent=fmt(subtotal-discount);}
function checkout(method){const p=products.find(x=>x.id===variant.value);const q=Number(qty.value);const total=document.querySelector('#total').textContent;const subject=encodeURIComponent(`Bestellung FLAG SERIES ${p.name}`);const body=encodeURIComponent(`Hallo FLAG SERIES Team,\n\nich möchte bestellen:\nEdition: ${p.name}\nMenge: ${q} Box(en)\nGesamt: ${total}\nZahlungsart: ${method}\n\nName:\nAdresse:\nTelefon:\n`);window.location.href=`mailto:bestellung@flagseries.de?subject=${subject}&body=${body}`;}
renderProducts();updatePrice();
grid.addEventListener('click',e=>{const card=e.target.closest('.product-card');if(card)selectProduct(card.dataset.id);});
variant.addEventListener('change',e=>selectProduct(e.target.value));qty.addEventListener('input',updatePrice);
document.querySelector('#paypalBtn').addEventListener('click',()=>checkout('PayPal'));
document.querySelector('#bankBtn').addEventListener('click',()=>checkout('Banküberweisung'));
