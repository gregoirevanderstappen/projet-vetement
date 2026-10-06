/*
 * En-tête (menu à trois barres), pied de page, panier et paiement Shopify.
 * Partagé par toutes les pages.
 */
(function () {
  "use strict";

  var CFG = window.SITE_CONFIG;
  var COL = window.COLLECTION;
  var CART_KEY = "gvds-cart-v1";

  /* ---------- Utilitaires ---------- */

  function el(html) {
    var t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstChild;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function euro(n) {
    return n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  function findProduct(id) {
    return COL.products.filter(function (p) { return p.id === id; })[0];
  }

  /* ---------- Précommande ---------- */

  function parseDay(s, endOfDay) {
    if (!s) return null;
    var p = s.split("-").map(Number);
    return endOfDay ? new Date(p[0], p[1] - 1, p[2], 23, 59, 59) : new Date(p[0], p[1] - 1, p[2], 0, 0, 0);
  }

  function addDays(d, n) {
    var r = new Date(d.getTime());
    r.setDate(r.getDate() + n);
    return r;
  }

  function longDate(d) {
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  }

  function preorder() {
    var now = new Date();
    var start = parseDay(CFG.preorderStart, false);
    var end = parseDay(CFG.preorderEnd, true);
    var state = "open";
    if (start && now < start) state = "upcoming";
    else if (end && now > end) state = "closed";
    var delivery = end ? addDays(end, CFG.deliveryEstimateDays) : null;
    return { state: state, start: start, end: end, delivery: delivery };
  }

  // Phrase de délai réutilisée partout (fiche produit, panier, FAQ)
  function deliverySentence() {
    var p = preorder();
    if (p.delivery) {
      return "Article en précommande : fabrication après la clôture du " + longDate(p.end) +
        ", livraison estimée autour du " + longDate(p.delivery) + ".";
    }
    return "Article en précommande : fabriqué après la clôture des précommandes, puis livré en " +
      CFG.deliveryEstimateDays + " jours environ.";
  }

  /* ---------- Panier (stocké dans le navigateur) ---------- */

  function readCart() {
    try {
      var c = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      return Array.isArray(c) ? c.filter(function (l) { return findProduct(l.id); }) : [];
    } catch (e) {
      return [];
    }
  }

  function writeCart(c) {
    try { localStorage.setItem(CART_KEY, JSON.stringify(c)); } catch (e) { /* navigation privée */ }
    renderCart();
  }

  function addToCart(id, color, size, qty) {
    var c = readCart();
    var line = c.filter(function (l) { return l.id === id && l.color === color && l.size === size; })[0];
    if (line) line.qty = Math.min(line.qty + qty, 20);
    else c.push({ id: id, color: color, size: size, qty: qty });
    writeCart(c);
    openCart();
  }

  function setQty(i, qty) {
    var c = readCart();
    if (!c[i]) return;
    if (qty <= 0) c.splice(i, 1);
    else c[i].qty = Math.min(qty, 20);
    writeCart(c);
  }

  /* ---------- Shopify (Storefront API) ---------- */

  function shopifyReady() {
    return !!(CFG.shopify.shopDomain && CFG.shopify.storefrontToken);
  }

  function storefront(query, variables) {
    var s = CFG.shopify;
    return fetch("https://" + s.shopDomain + "/api/" + s.apiVersion + "/graphql.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": s.storefrontToken
      },
      body: JSON.stringify({ query: query, variables: variables })
    }).then(function (r) {
      if (!r.ok) throw new Error("Shopify a répondu " + r.status);
      return r.json();
    }).then(function (j) {
      if (j.errors && j.errors.length) throw new Error(j.errors[0].message);
      return j.data;
    });
  }

  var VARIANTS_QUERY =
    "query($h:String!){product(handle:$h){variants(first:100){nodes{id selectedOptions{name value}}}}}";

  var CART_CREATE =
    "mutation($input:CartInput!){cartCreate(input:$input){cart{checkoutUrl} userErrors{message}}}";

  function variantId(nodes, color, size) {
    var s = CFG.shopify;
    var wantColor = COL.colors[color].label.toLowerCase();
    var wantSize = size.toLowerCase();
    var match = nodes.filter(function (v) {
      var o = {};
      v.selectedOptions.forEach(function (x) { o[x.name.toLowerCase()] = x.value.toLowerCase(); });
      return o[s.colorOptionName.toLowerCase()] === wantColor && o[s.sizeOptionName.toLowerCase()] === wantSize;
    })[0];
    return match && match.id;
  }

  function checkout() {
    var c = readCart();
    if (!c.length) return Promise.resolve();
    var handles = {};
    c.forEach(function (l) { handles[findProduct(l.id).handle] = true; });

    return Promise.all(Object.keys(handles).map(function (h) {
      return storefront(VARIANTS_QUERY, { h: h }).then(function (d) {
        if (!d.product) throw new Error("Produit « " + h + " » introuvable dans Shopify.");
        return [h, d.product.variants.nodes];
      });
    })).then(function (pairs) {
      var byHandle = {};
      pairs.forEach(function (p) { byHandle[p[0]] = p[1]; });
      var lines = c.map(function (l) {
        var p = findProduct(l.id);
        var id = variantId(byHandle[p.handle], l.color, l.size);
        if (!id) throw new Error("Variante introuvable : " + p.name + " / " + COL.colors[l.color].label + " / " + l.size);
        return {
          merchandiseId: id,
          quantity: l.qty,
          attributes: [{ key: "Précommande", value: "Expédition après la clôture des précommandes" }]
        };
      });
      return storefront(CART_CREATE, { input: { lines: lines, note: "Commande en précommande — " + COL.name } });
    }).then(function (d) {
      var r = d.cartCreate;
      if (r.userErrors && r.userErrors.length) throw new Error(r.userErrors[0].message);
      window.location.href = r.cart.checkoutUrl;
    });
  }

  /* ---------- En-tête et menu ---------- */

  function renderHeader() {
    var here = location.pathname.split("/").pop() || "index.html";
    var links = CFG.menu.map(function (m, i) {
      var current = m.href === here || (here === "produit.html" && m.href === "index.html");
      return '<li style="--i:' + i + '"><a href="' + esc(m.href) + '"' +
        (current ? ' aria-current="page"' : "") +
        (m.highlight ? ' class="is-new"' : "") + ">" + esc(m.label) +
        (m.highlight ? ' <span class="pill">Nouveau</span>' : "") + "</a></li>";
    }).join("");

    var header = el(
      '<header class="site-header">' +
        '<div class="site-header__inner">' +
          '<button class="burger" type="button" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="site-menu">' +
            "<span></span><span></span><span></span>" +
          "</button>" +
          '<a class="brand" href="' + esc(CFG.homeUrl) + '">' + esc(CFG.siteName) + "</a>" +
          '<button class="cart-btn" type="button" aria-label="Ouvrir le panier">' +
            'Panier <span class="cart-count" aria-live="polite">0</span>' +
          "</button>" +
        "</div>" +
      "</header>"
    );

    var menu = el(
      '<div class="menu" id="site-menu" hidden>' +
        '<div class="menu__backdrop" data-close></div>' +
        '<nav class="menu__panel" aria-label="Menu principal">' +
          '<button class="menu__close" type="button" aria-label="Fermer le menu" data-close>&times;</button>' +
          '<p class="menu__eyebrow">' + esc(CFG.siteName) + "</p>" +
          '<ul class="menu__list">' + links + "</ul>" +
          (CFG.instagram ? '<a class="menu__social" href="' + esc(CFG.instagram) + '" target="_blank" rel="noopener">Instagram</a>' : "") +
        "</nav>" +
      "</div>"
    );

    document.body.prepend(menu);
    document.body.prepend(header);

    var burger = header.querySelector(".burger");
    setupPanel(menu, burger, "menu-open");
    header.querySelector(".cart-btn").addEventListener("click", openCart);
  }

  // Ouverture / fermeture d'un panneau latéral (menu ou panier)
  function setupPanel(root, trigger, bodyClass) {
    var lastFocus = null;

    function open() {
      lastFocus = document.activeElement;
      root.hidden = false;
      requestAnimationFrame(function () {
        root.classList.add("is-open");
        document.body.classList.add(bodyClass);
        if (trigger) trigger.setAttribute("aria-expanded", "true");
        var f = root.querySelector("a, button");
        if (f) f.focus();
      });
    }

    function close() {
      root.classList.remove("is-open");
      document.body.classList.remove(bodyClass);
      if (trigger) trigger.setAttribute("aria-expanded", "false");
      setTimeout(function () { if (!root.classList.contains("is-open")) root.hidden = true; }, 350);
      if (lastFocus) lastFocus.focus();
    }

    if (trigger) trigger.addEventListener("click", function () { root.hidden ? open() : close(); });
    root.addEventListener("click", function (e) {
      if (e.target.closest("[data-close]")) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !root.hidden) close();
    });
    root._open = open;
    root._close = close;
  }

  /* ---------- Panier : affichage ---------- */

  var cartRoot;

  function renderCartShell() {
    cartRoot = el(
      '<div class="drawer" hidden>' +
        '<div class="drawer__backdrop" data-close></div>' +
        '<aside class="drawer__panel" aria-label="Panier">' +
          '<div class="drawer__head"><h2>Panier</h2>' +
            '<button class="menu__close" type="button" aria-label="Fermer le panier" data-close>&times;</button></div>' +
          '<div class="drawer__body"></div>' +
          '<div class="drawer__foot"></div>' +
        "</aside>" +
      "</div>"
    );
    document.body.appendChild(cartRoot);
    setupPanel(cartRoot, null, "cart-open");

    cartRoot.addEventListener("click", function (e) {
      var b = e.target.closest("[data-qty]");
      if (b) setQty(+b.dataset.line, +b.dataset.qty);
      if (e.target.closest("[data-checkout]")) onCheckout(e.target.closest("[data-checkout]"));
    });
  }

  function openCart() { cartRoot._open(); }

  function renderCart() {
    var c = readCart();
    var count = c.reduce(function (n, l) { return n + l.qty; }, 0);
    var total = c.reduce(function (n, l) { return n + l.qty * findProduct(l.id).price; }, 0);
    var badge = document.querySelector(".cart-count");
    if (badge) badge.textContent = count;
    if (!cartRoot) return;

    var body = cartRoot.querySelector(".drawer__body");
    var foot = cartRoot.querySelector(".drawer__foot");

    if (!c.length) {
      body.innerHTML = '<p class="drawer__empty">Ton panier est vide.</p>';
      foot.innerHTML = "";
      return;
    }

    body.innerHTML = c.map(function (l, i) {
      var p = findProduct(l.id);
      return '<div class="line">' +
        '<img src="assets/img/produits/' + p.images[l.color][0] + '" alt="" width="72" height="90">' +
        '<div class="line__info">' +
          '<p class="line__name">' + esc(p.name) + "</p>" +
          '<p class="line__meta">' + esc(COL.colors[l.color].label) + " · " + esc(l.size) + "</p>" +
          '<div class="qty">' +
            '<button type="button" data-line="' + i + '" data-qty="' + (l.qty - 1) + '" aria-label="Retirer un article">−</button>' +
            "<span>" + l.qty + "</span>" +
            '<button type="button" data-line="' + i + '" data-qty="' + (l.qty + 1) + '" aria-label="Ajouter un article">+</button>' +
          "</div>" +
        "</div>" +
        '<p class="line__price">' + euro(p.price * l.qty) + "</p>" +
      "</div>";
    }).join("");

    var closed = preorder().state !== "open";
    foot.innerHTML =
      '<p class="drawer__notice">' + esc(deliverySentence()) + "</p>" +
      '<div class="drawer__total"><span>Total TTC</span><span>' + euro(total) + "</span></div>" +
      '<p class="drawer__small">Frais de livraison calculés à l\'étape suivante.</p>' +
      '<button class="btn btn--full" type="button" data-checkout' + (closed ? " disabled" : "") + ">" +
        (closed ? "Précommandes fermées" : "Valider ma précommande") + "</button>" +
      '<p class="drawer__error" role="alert"></p>';
  }

  function onCheckout(btn) {
    var err = cartRoot.querySelector(".drawer__error");
    err.textContent = "";
    if (!shopifyReady()) {
      err.textContent = "Le paiement en ligne ouvre très bientôt. " +
        (CFG.contactEmail ? "En attendant, écris-moi à " + CFG.contactEmail + "." : "");
      return;
    }
    btn.disabled = true;
    btn.textContent = "Redirection vers le paiement…";
    checkout().catch(function (e) {
      console.error(e);
      btn.disabled = false;
      btn.textContent = "Valider ma précommande";
      err.textContent = "Le paiement n'a pas pu s'ouvrir. Réessaie dans un instant.";
    });
  }

  /* ---------- Pied de page ---------- */

  function renderFooter() {
    var year = new Date().getFullYear();
    document.body.appendChild(el(
      '<footer class="site-footer">' +
        '<div class="site-footer__inner">' +
          '<p class="brand brand--small">' + esc(CFG.siteName) + "</p>" +
          "<p>Artiste sculpteur — collection textile " + esc(COL.name) + "</p>" +
          '<p class="site-footer__links">' +
            (CFG.contactEmail ? '<a href="mailto:' + esc(CFG.contactEmail) + '">' + esc(CFG.contactEmail) + "</a>" : "") +
            (CFG.instagram ? '<a href="' + esc(CFG.instagram) + '" target="_blank" rel="noopener">Instagram</a>' : "") +
          "</p>" +
          '<p class="site-footer__copy">© ' + year + " " + esc(CFG.siteName) + ". Tous droits réservés.</p>" +
        "</div>" +
      "</footer>"
    ));
  }

  /* ---------- Bandeau précommande ---------- */

  function renderBanner() {
    var p = preorder();
    var txt;
    if (p.state === "upcoming") txt = "Ouverture des précommandes le " + longDate(p.start);
    else if (p.state === "closed") txt = "Les précommandes sont clôturées — merci ! Les pièces sont en fabrication.";
    else if (p.end) txt = "Précommandes ouvertes jusqu'au " + longDate(p.end) + " · Fabrication en série limitée";
    else txt = "Précommandes ouvertes · Fabrication en série limitée";
    document.body.prepend(el('<div class="banner">' + esc(txt) + "</div>"));
  }

  /* ---------- Démarrage ---------- */

  window.Shop = {
    esc: esc,
    euro: euro,
    findProduct: findProduct,
    preorder: preorder,
    longDate: longDate,
    deliverySentence: deliverySentence,
    addToCart: addToCart
  };

  document.addEventListener("DOMContentLoaded", function () {
    renderHeader();
    renderBanner();
    renderCartShell();
    renderCart();
    renderFooter();

    // Apparition douce des sections au défilement
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
        });
      }, { rootMargin: "0px 0px -10% 0px" });
      document.querySelectorAll(".reveal").forEach(function (n) { io.observe(n); });
    } else {
      document.querySelectorAll(".reveal").forEach(function (n) { n.classList.add("is-visible"); });
    }
  });
})();
