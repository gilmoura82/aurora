/* ---------------- utilidades ---------------- */
const PASSCODE = "AURORA2026"; // troque por uma senha só sua

function el(tag, cls, html){
  const e = document.createElement(tag);
  if(cls) e.className = cls;
  if(html !== undefined) e.innerHTML = html;
  return e;
}

/* estrelas de fundo */
(function stars(){
  const box = document.getElementById('stars');
  for(let i=0;i<60;i++){
    const s = document.createElement('span');
    s.style.top = Math.random()*100+'%';
    s.style.left = Math.random()*100+'%';
    s.style.animationDelay = (Math.random()*5)+'s';
    s.style.opacity = Math.random()*0.6+0.2;
    box.appendChild(s);
  }
})();

/* brilho seguindo o cursor no hero */
(function cursorGlow(){
  const art = document.getElementById('heroArt');
  const glow = document.getElementById('cursorGlow');
  if(!art || window.matchMedia('(pointer:coarse)').matches) return;
  art.addEventListener('mousemove', (e)=>{
    const r = art.getBoundingClientRect();
    glow.style.transform = `translate(${e.clientX - r.left - 170}px, ${e.clientY - r.top - 170}px)`;
  });
})();

/* ---------------- storage helper (com fallback em memória) ---------------- */
const mem = {};
async function sGet(key){
  try{
    if(window.storage){
      const r = await window.storage.get(key, true);
      return r ? JSON.parse(r.value) : null;
    }
  }catch(e){ /* chave não existe ainda */ }
  return mem[key] ?? null;
}
async function sSet(key, value){
  try{
    if(window.storage){
      await window.storage.set(key, JSON.stringify(value), true);
      return;
    }
  }catch(e){}
  mem[key] = value;
}

/* ---------------- PORTFÓLIO ---------------- */
const defaultGallery = [
  {caption:"Make noiva — pele iluminada"},
  {caption:"Produção para ensaio editorial"},
  {caption:"Make de festa — glitter dourado"},
  {caption:"Dia a dia — pele natural"},
  {caption:"Debutante — tons rosados"},
  {caption:"Noite — esfumado marcante"}
];

async function renderGallery(){
  const grid = document.getElementById('galleryGrid');
  grid.innerHTML = "";
  let photos = await sGet('gallery');
  if(!photos){
    grid.innerHTML = defaultGallery.map(p => `
      <div class="g-item">
        <div class="g-placeholder">${p.caption}</div>
      </div>
    `).join('');
    return;
  }
  photos.slice().reverse().forEach(p=>{
    const item = el('div','g-item', `
      <img src="${p.src}" alt="${p.caption || 'Trabalho de maquiagem'}">
      ${p.caption ? `<div class="cap">${p.caption}</div>` : ''}
    `);
    grid.appendChild(item);
  });
}
renderGallery();

document.getElementById('proToggleBtn').addEventListener('click', ()=>{
  document.getElementById('proPanel').classList.toggle('open');
});
document.getElementById('proUnlock').addEventListener('click', ()=>{
  const val = document.getElementById('proPass').value;
  if(val === PASSCODE){
    document.getElementById('proUpload').style.display = 'block';
    document.getElementById('proPass').style.display = 'none';
    document.getElementById('proUnlock').style.display = 'none';
  } else {
    alert('Senha incorreta.');
  }
});
document.getElementById('fileInput').addEventListener('change', (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (ev)=>{
    const img = new Image();
    img.onload = async ()=>{
      const canvas = document.createElement('canvas');
      const maxW = 900;
      const scale = Math.min(1, maxW / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
      const caption = document.getElementById('capInput').value.trim();
      let photos = await sGet('gallery') || [];
      photos.push({src:dataUrl, caption});
      await sSet('gallery', photos);
      document.getElementById('capInput').value = '';
      document.getElementById('fileInput').value = '';
      renderGallery();
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
});

/* ---------------- DEPOIMENTOS ---------------- */
const defaultTestimonials = [
  {name:"Camila R.", role:"Cliente — make de festa", rating:5, text:"Nunca me senti tão bonita! Ela entendeu exatamente o que eu queria e a make durou a noite inteira."},
  {name:"Beatriz S.", role:"Cliente — noiva", rating:5, text:"Profissionalismo e talento em cada detalhe. Chorei de emoção ao me ver no espelho."},
  {name:"Larissa M.", role:"Cliente — dia a dia", rating:5, text:"Super atenciosa e caprichosa. Já virou minha maquiadora de confiança."},
  {name:"Júlia F.", role:"Cliente — debutante", rating:5, text:"Um talento incrível para realçar a beleza natural. Recomendo de olhos fechados."}
];

function starString(n){
  return "★★★★★".slice(0,n) + "☆☆☆☆☆".slice(0,5-n);
}

async function renderTestimonials(){
  const box = document.getElementById('testScroll');
  box.innerHTML = "";
  let list = await sGet('testimonials');
  if(!list){ list = defaultTestimonials; }
  list.slice().reverse().forEach(t=>{
    const initials = t.name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
    const card = el('div','test-card', `
      <div class="stars-row">${starString(t.rating || 5)}</div>
      <p>"${t.text}"</p>
      <div class="test-who">
        <div class="avatar">${initials}</div>
        <div>
          <div class="name">${t.name}</div>
          <div class="role">${t.role || 'Cliente'}</div>
        </div>
      </div>
    `);
    box.appendChild(card);
  });
}
renderTestimonials();

let chosenStars = 5;
const starPick = document.getElementById('starPick');
function paintStars(){
  [...starPick.children].forEach(s=>{
    s.classList.toggle('active', parseInt(s.dataset.v) <= chosenStars);
  });
}
paintStars();
starPick.addEventListener('click', (e)=>{
  if(e.target.dataset.v){
    chosenStars = parseInt(e.target.dataset.v);
    paintStars();
  }
});

document.getElementById('tSubmit').addEventListener('click', async ()=>{
  const name = document.getElementById('tName').value.trim();
  const text = document.getElementById('tText').value.trim();
  if(!name || !text){ alert('Preencha seu nome e o depoimento.'); return; }
  let list = await sGet('testimonials');
  if(!list) list = defaultTestimonials.slice();
  list.push({name, role:'Cliente', rating:chosenStars, text});
  await sSet('testimonials', list);
  document.getElementById('tName').value = '';
  document.getElementById('tText').value = '';
  chosenStars = 5; paintStars();
  renderTestimonials();
});

/* ---------------- AGENDA ---------------- */
const diasSemana = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const horarios = ['09:00','10:00','11:00','12:00','13:30','14:30','15:30','16:30','17:30','18:30'];

function nextDays(n){
  const arr = [];
  const today = new Date();
  for(let i=0;i<n;i++){
    const d = new Date(today);
    d.setDate(today.getDate()+i);
    arr.push(d);
  }
  return arr;
}
function dateKey(d){
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

let selectedDate = null;
let selectedSlot = null;

function renderDays(){
  const col = document.getElementById('daysCol');
  col.innerHTML = "";
  nextDays(14).forEach((d,i)=>{
    const pill = el('div','day-pill', `<span class="d">${d.getDate()} ${meses[d.getMonth()]}</span><span class="m">${diasSemana[d.getDay()]}</span>`);
    pill.addEventListener('click', ()=>selectDay(d, pill));
    col.appendChild(pill);
    if(i===0){ selectDay(d, pill); }
  });
}

async function selectDay(d, pillEl){
  document.querySelectorAll('.day-pill').forEach(p=>p.classList.remove('active'));
  pillEl.classList.add('active');
  selectedDate = d;
  selectedSlot = null;
  document.getElementById('bookForm').classList.remove('open');
  document.getElementById('confirmMsg').classList.remove('open');
  document.getElementById('slotsTitle').textContent = `${diasSemana[d.getDay()]}, ${d.getDate()} de ${meses[d.getMonth()]}`;
  document.getElementById('slotsSub').textContent = 'Clique em um horário livre para reservar.';
  await renderSlots();
}

async function renderSlots(){
  const grid = document.getElementById('slotsGrid');
  grid.innerHTML = "";
  const key = 'bookings:' + dateKey(selectedDate);
  const bookings = await sGet(key) || [];
  const takenTimes = bookings.map(b=>b.time);
  horarios.forEach(h=>{
    const taken = takenTimes.includes(h);
    const slot = el('div', 'slot' + (taken ? ' taken' : ''), h);
    if(!taken){
      slot.addEventListener('click', ()=>{
        document.querySelectorAll('.slot').forEach(s=>s.classList.remove('selected'));
        slot.classList.add('selected');
        selectedSlot = h;
        document.getElementById('bookForm').classList.add('open');
        document.getElementById('confirmMsg').classList.remove('open');
      });
    }
    grid.appendChild(slot);
  });
}

document.getElementById('bSubmit').addEventListener('click', async ()=>{
  const name = document.getElementById('bName').value.trim();
  const phone = document.getElementById('bPhone').value.trim();
  if(!name || !phone){ alert('Preencha nome e WhatsApp.'); return; }
  if(!selectedSlot){ alert('Escolha um horário.'); return; }
  const key = 'bookings:' + dateKey(selectedDate);
  const bookings = await sGet(key) || [];
  bookings.push({time:selectedSlot, name, phone});
  await sSet(key, bookings);
  document.getElementById('bName').value = '';
  document.getElementById('bPhone').value = '';
  document.getElementById('bookForm').classList.remove('open');
  const msg = document.getElementById('confirmMsg');
  msg.textContent = `Horário confirmado para ${diasSemana[selectedDate.getDay()]}, ${selectedDate.getDate()} de ${meses[selectedDate.getMonth()]} às ${selectedSlot}. Você receberá a confirmação pelo WhatsApp.`;
  msg.classList.add('open');
  renderSlots();
});

renderDays();

/* ---------------- compartilhar ---------------- */
document.getElementById('shareBtn').addEventListener('click', async ()=>{
  if(navigator.share){
    try{ await navigator.share({title:'Aurora Maquiagem', text:'Confira meu trabalho de maquiagem!', url:location.href}); }catch(e){}
  } else {
    document.getElementById('copyBtn').click();
  }
});
document.getElementById('copyBtn').addEventListener('click', ()=>{
  navigator.clipboard.writeText(location.href).then(()=>{
    alert('Link copiado!');
  });
});