document.addEventListener('DOMContentLoaded', function () {
  var btn = document.getElementById('navToggle');
  var nav = document.getElementById('mainNav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      if (nav.style.display === 'flex') nav.style.display = 'none'; else nav.style.display = 'flex';
    });
  }
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Product gallery filtering
  var tabs = document.querySelectorAll('.tab');
  var items = document.querySelectorAll('[data-category]');
  function setActiveTab(active) {
    tabs.forEach(function (t) { t.classList.toggle('active', t.dataset.cat === active); });
    items.forEach(function (it) {
      if (active === 'all' || it.dataset.category === active) { it.style.display = ''; }
      else { it.style.display = 'none'; }
    });
  }
  if (tabs.length) {
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () { setActiveTab(tab.dataset.cat); });
    });
    function getInitialCategory() {
      var params = new URLSearchParams(window.location.search);
      var category = params.get('category');
      var allowed = Array.from(tabs).map(function (t) { return t.dataset.cat; });
      return allowed.indexOf(category) !== -1 ? category : (document.querySelector('.tab.active') && document.querySelector('.tab.active').dataset.cat) || 'all';
    }
    setActiveTab(getInitialCategory());
  }

  // Product detail modal handlers: show image, title, price, Inquiry and Add to Cart
  var modal = document.getElementById('productModal');
  var modalImage = document.getElementById('modalImage');
  var modalTitle = document.getElementById('modalTitle');
  var modalPrice = document.getElementById('modalPrice');
  var modalInquiry = document.getElementById('modalInquiry');
  var modalAddCart = document.getElementById('modalAddCart');

  // Cart elements
  var cartToggle = document.getElementById('cartToggle');
  var cartCount = document.getElementById('cartCount');
  var cartDrawer = document.getElementById('cartDrawer');
  var cartClose = document.getElementById('cartClose');
  var cartList = document.getElementById('cartList');
  var cartTotal = document.getElementById('cartTotal');
  var cartClear = document.getElementById('cartClear');

  function getCart(){ try{return JSON.parse(localStorage.getItem('cart')||'[]')}catch(e){return []} }
  function setCart(c){ localStorage.setItem('cart', JSON.stringify(c)); }
  function parsePrice(p){ if(!p) return 0; var s = String(p).replace(/[^0-9.]/g,''); return parseFloat(s)||0; }

  function renderCart(){
    var items = getCart();
    if(cartCount) cartCount.textContent = items.length || 0;
    if(!cartList) return;
    cartList.innerHTML = '';
    var total = 0;
    items.forEach(function(it, idx){
      total += parsePrice(it.price);
      var li = document.createElement('li'); li.className='cart-item';
      li.innerHTML = '<img src="'+(it.img||'')+'" alt="'+(it.title||'')+'">'
        +'<div class="meta"><h4>'+ (it.title||'Product') +'</h4><div class="price">'+ (it.price||'') +'</div></div>'
        +'<button class="remove" data-idx="'+idx+'">Remove</button>';
      cartList.appendChild(li);
    });
    if(cartTotal) cartTotal.textContent = '₹' + Math.round(total);
  }

  function openCart(){ if(cartDrawer) { cartDrawer.classList.add('open'); cartDrawer.setAttribute('aria-hidden','false'); } }
  function closeCart(){ if(cartDrawer) { cartDrawer.classList.remove('open'); cartDrawer.setAttribute('aria-hidden','true'); } }

  // wire cart toggle controls
  if(cartToggle){ cartToggle.addEventListener('click', function(e){ e.preventDefault(); openCart(); }); }
  if(cartClose){ cartClose.addEventListener('click', closeCart); }
  if(cartClear){ cartClear.addEventListener('click', function(){ setCart([]); renderCart(); }); }
  if(cartList){ cartList.addEventListener('click', function(e){ var btn = e.target.closest('.remove'); if(!btn) return; var idx = parseInt(btn.dataset.idx,10); var c = getCart(); if(!isNaN(idx)) { c.splice(idx,1); setCart(c); renderCart(); } }); }

  // sync across tabs
  window.addEventListener('storage', function(){ renderCart(); });


  function openProductModal(card) {
    var img = card.querySelector('.product-media img') && card.querySelector('.product-media img').src || '';
    var title = card.querySelector('.product-title') && card.querySelector('.product-title').textContent || '';
    var priceOld = card.querySelector('.price-old') && card.querySelector('.price-old').textContent || '';
    var price = card.querySelector('.price') && card.querySelector('.price').textContent || '';
    if (modalImage) { modalImage.src = img; modalImage.alt = title; }
    if (modalTitle) modalTitle.textContent = title;
    if (modalPrice) modalPrice.innerHTML = (priceOld ? '<span class="price-old">'+priceOld+'</span>' : '') + '<span class="price">'+price+'</span>';
    if (modalInquiry) {
      var inquire = card.querySelector('.inquire-btn');
      if (inquire) { modalInquiry.href = inquire.href; modalInquiry.setAttribute('target', inquire.target || '_blank'); }
      else { modalInquiry.href = '#'; }
    }
    if (modalAddCart) {
      modalAddCart.dataset.title = title;
      modalAddCart.dataset.price = price;
      modalAddCart.dataset.img = img;
      modalAddCart.textContent = 'Add to cart' + (price ? ' • ' + price : '');
      modalAddCart.disabled = false;
    }
    if (modal) { modal.style.display = 'flex'; modal.setAttribute('aria-hidden','false'); }
  }

  function closeModal(){ if(modal){ modal.style.display='none'; modal.setAttribute('aria-hidden','true'); } }

  // add-to-cart action: store minimal cart in localStorage
  if(modalAddCart){
    modalAddCart.addEventListener('click', function(){
      var item = { title:this.dataset.title||'Product', price:this.dataset.price||'', img:this.dataset.img||'' };
      try{
        var cart = JSON.parse(localStorage.getItem('cart')||'[]');
        cart.push(item);
        localStorage.setItem('cart', JSON.stringify(cart));
        this.textContent = 'Added'; this.disabled = true; renderCart(); setTimeout(closeModal,600);
      }catch(err){ alert('Could not add to cart'); }
    });
  }

  document.querySelectorAll('.product-card').forEach(function(card){
    card.addEventListener('click', function(e){
      if(e.target.closest('.inquire-btn')) return; // let inquiry click through
      openProductModal(card);
    });
  });

  document.querySelectorAll('.modal-close').forEach(function(btn){ btn.addEventListener('click', closeModal); });
  if(modal){ modal.addEventListener('click', function(e){ if(e.target===modal) closeModal(); }); }
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeModal(); });

  // initial cart render
  renderCart();

});
