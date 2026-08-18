/* ============ NAVBAR ============ */
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
});

/* ============ REVEAL ON SCROLL ============ */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* ============ CAROUSEL ============ */
function buildCarousel(root){
  const track = root.querySelector('.carousel__track');
  const slides = Array.from(track.children);
  const prev = root.querySelector('.carousel__btn--prev');
  const next = root.querySelector('.carousel__btn--next');
  const dotsWrap = root.querySelector('.carousel__dots');

  const dDesktop = parseInt(root.dataset.desktop || '3', 10);
  const dTablet  = parseInt(root.dataset.tablet  || '2', 10);
  const dMobile  = parseInt(root.dataset.mobile  || '2', 10);

  let perView = dDesktop;
  let gap = 24;
  let index = 0;
  let maxIndex = 0;

  function computePerView(){
    const w = window.innerWidth;
    if (w < 768) { perView = dMobile; gap = 16; }
    else if (w < 1024) { perView = dTablet; gap = 20; }
    else { perView = dDesktop; gap = 24; }
    perView = Math.min(perView, slides.length);
  }

  function layout(){
    computePerView();
    const vpWidth = track.parentElement.clientWidth;
    const slideWidth = (vpWidth - gap * (perView - 1)) / perView;
    track.style.gap = gap + 'px';
    slides.forEach(s => { s.style.width = slideWidth + 'px'; });
    maxIndex = Math.max(0, slides.length - perView);
    if (index > maxIndex) index = maxIndex;
    buildDots();
    update();
  }

  function buildDots(){
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    const pages = maxIndex + 1;
    for (let i = 0; i < pages; i++){
      const b = document.createElement('button');
      b.type = 'button';
      b.addEventListener('click', () => { index = i; update(); });
      dotsWrap.appendChild(b);
    }
  }

  function update(){
    const vpWidth = track.parentElement.clientWidth;
    const slideWidth = (vpWidth - gap * (perView - 1)) / perView;
    track.style.transform = `translateX(${-(slideWidth + gap) * index}px)`;
    if (prev) prev.disabled = index <= 0;
    if (next) next.disabled = index >= maxIndex;
    if (dotsWrap){
      Array.from(dotsWrap.children).forEach((d, i) => d.classList.toggle('active', i === index));
    }
  }

  prev && prev.addEventListener('click', () => { if (index > 0){ index--; update(); } });
  next && next.addEventListener('click', () => { if (index < maxIndex){ index++; update(); } });

  /* touch / drag swipe */
  let startX = 0, dragging = false;
  const vp = root.querySelector('.carousel__viewport');
  vp.addEventListener('touchstart', e => { startX = e.touches[0].clientX; dragging = true; }, { passive:true });
  vp.addEventListener('touchend', e => {
    if (!dragging) return;
    dragging = false;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40){
      if (dx < 0 && index < maxIndex) index++;
      else if (dx > 0 && index > 0) index--;
      update();
    }
  }, { passive:true });

  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(layout, 150); });
  window.addEventListener('load', layout);
  layout();
}
document.querySelectorAll('.carousel').forEach(buildCarousel);

/* ============ LIGHTBOX ============ */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');

document.querySelectorAll('.card--project').forEach(card => {
  card.addEventListener('click', () => {
    const src = card.dataset.img;
    if (!src) return;
    lightboxImg.src = src;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  });
});

function closeLightbox(){
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  setTimeout(() => { lightboxImg.src = ''; }, 300);
}
lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox(); });

/* ============ CONTACT FORM ============ */
const fileInput = document.getElementById('fileInput');
const fileText = document.getElementById('fileText');
if (fileInput){
  fileInput.addEventListener('change', () => {
    const n = fileInput.files.length;
    if (n === 0) fileText.textContent = 'Pasirinkite failus (planai, nuotraukos)';
    else if (n === 1) fileText.textContent = fileInput.files[0].name;
    else fileText.textContent = n + ' failai pasirinkti';
  });
}

const contactForm = document.getElementById('contactForm');
if (contactForm){
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    if (!contactForm.checkValidity()){ contactForm.reportValidity(); return; }
    const note = document.getElementById('formNote');
    note.hidden = false;
    contactForm.querySelector('.form-submit').textContent = 'Užklausa paruošta';
    setTimeout(() => {
      contactForm.reset();
      if (fileText) fileText.textContent = 'Pasirinkite failus (planai, nuotraukos)';
    }, 400);
  });
}
