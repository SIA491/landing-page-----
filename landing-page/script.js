const MOODS={fresh:'Fresh',sweet:'Sweet',confident:'Confident',romance:'Romance'};
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

function initProductPage(){
  const bar=$('#filter-bar'),list=$('#product-list');
  let products=[],cur=new URLSearchParams(location.search).get('mood')||'all';
  if(cur!=='all'&&!MOODS[cur])cur='all';
  function render(){
    bar.innerHTML=[['all','ทั้งหมด'],...Object.entries(MOODS)].map(([k,t])=>`<button data-f="${k}" class="${cur===k?'on':''}">${t}</button>`).join('');
    bar.querySelectorAll('button').forEach(b=>b.onclick=()=>{cur=b.dataset.f;render()});
    list.innerHTML=products.filter(p=>cur==='all'||p.mood===cur).map(p=>`<div class="card"><img src="${esc(p.image)}" alt="${esc(p.name)}"><div class="bar" style="background:var(--${p.mood})"></div><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><div class="price">${p.price} บาท</div><a class="btn" href="order.html?item=${encodeURIComponent(p.name)}&price=${p.price}">สั่งซื้อ</a></div>`).join('');
  }
  fetch('products.json').then(r=>r.json()).then(d=>{products=d;render()})
   .catch(e=>{console.error(e);list.innerHTML='<p>โหลดสินค้าไม่สำเร็จ (ต้องเปิดผ่านเว็บเซิร์ฟเวอร์ เช่น Vercel)</p>'});
}
function initOrderPage(){
  const q=new URLSearchParams(location.search);
  $('#items').value=q.get('item')||'';
  $('#total').value=q.get('price')||'';
  $('#orderForm').addEventListener('submit',e=>{
    e.preventDefault();
    const payload={customerName:$('#customerName').value.trim(),contact:$('#contact').value.trim(),items:$('#items').value.trim(),total:$('#total').value.trim(),note:$('#note').value.trim(),timestamp:new Date().toISOString()};
    try{
      const all=JSON.parse(localStorage.getItem('bodyScentOrders')||'[]');
      all.push(payload);
      localStorage.setItem('bodyScentOrders',JSON.stringify(all));
      window.location.href='thankyou.html';
    }catch(err){console.error(err);alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')}
  });
}
function initAdminPage(){
  let o=[];try{o=JSON.parse(localStorage.getItem('bodyScentOrders')||'[]')}catch(e){}
  o.sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp));
  $('#ordersTable tbody').innerHTML=o.length?o.map(r=>`<tr><td>${new Date(r.timestamp).toLocaleString('th-TH')}</td><td>${esc(r.customerName)}</td><td>${esc(r.contact)}</td><td>${esc(r.items)}</td><td>${esc(r.total)}</td><td>${esc(r.note||'-')}</td></tr>`).join(''):'<tr><td colspan="6" style="text-align:center;color:var(--muted)">ยังไม่มีคำสั่งซื้อ</td></tr>';
}
document.addEventListener('DOMContentLoaded',()=>{
  if($('#product-list'))initProductPage();
  if($('#orderForm'))initOrderPage();
  if($('#ordersTable'))initAdminPage();
});
