/* Page collection (index.html) */
(function () {
  "use strict";

  var COL = window.COLLECTION;
  var CFG = window.SITE_CONFIG;
  var S = window.Shop;
  var IMG = "assets/img/produits/";

  /* Grille des produits */
  var grid = document.getElementById("product-grid");
  grid.innerHTML = COL.products.map(function (p) {
    var swatches = Object.keys(p.images).map(function (c, i) {
      return '<button type="button" class="swatch' + (i === 0 ? " is-active" : "") + '" data-color="' + c + '"' +
        ' style="--sw:' + COL.colors[c].swatch + '" aria-label="' + S.esc(COL.colors[c].label) + '"' +
        ' aria-pressed="' + (i === 0) + '"></button>';
    }).join("");
    var first = Object.keys(p.images)[0];
    return '<article class="card reveal" data-id="' + p.id + '">' +
      '<a class="card__media" href="produit.html?modele=' + p.id + "&couleur=" + first + '">' +
        '<img class="card__front" src="' + IMG + p.images[first][p.cover] + '" alt="' + S.esc(p.name) + '" loading="lazy">' +
        '<img class="card__back" src="' + IMG + p.images[first][1 - p.cover] + '" alt="" loading="lazy">' +
        '<span class="tag">Précommande</span>' +
      "</a>" +
      '<div class="card__body">' +
        '<div class="card__row">' +
          '<h3 class="card__name"><a href="produit.html?modele=' + p.id + "&couleur=" + first + '">' + S.esc(p.name) + "</a></h3>" +
          '<p class="card__price">' + S.euro(p.price) + "</p>" +
        "</div>" +
        '<p class="card__tag">' + S.esc(p.tagline) + "</p>" +
        '<div class="swatches" role="group" aria-label="Couleur">' + swatches + "</div>" +
      "</div>" +
    "</article>";
  }).join("");

  // Changement de couleur sur la carte
  grid.addEventListener("click", function (e) {
    var b = e.target.closest(".swatch");
    if (!b) return;
    var card = b.closest(".card");
    var p = S.findProduct(card.dataset.id);
    var c = b.dataset.color;
    card.querySelector(".card__front").src = IMG + p.images[c][p.cover];
    card.querySelector(".card__back").src = IMG + p.images[c][1 - p.cover];
    card.querySelectorAll("a[href^='produit.html']").forEach(function (a) {
      a.href = "produit.html?modele=" + p.id + "&couleur=" + c;
    });
    card.querySelectorAll(".swatch").forEach(function (s) {
      s.classList.toggle("is-active", s === b);
      s.setAttribute("aria-pressed", s === b);
    });
  });

  /* Fiche technique */
  var sp = COL.specs;
  document.getElementById("specs").innerHTML =
    '<dl class="specs__top">' +
      "<div><dt>Poids</dt><dd>" + sp.weight + "</dd></div>" +
      "<div><dt>Coupe</dt><dd>" + sp.fit + "</dd></div>" +
      "<div><dt>Tailles</dt><dd>" + sp.sizes + "</dd></div>" +
    "</dl>" +
    '<div class="specs__block"><h3>Détails</h3><ul>' + sp.details.map(function (d) { return "<li>" + S.esc(d) + "</li>"; }).join("") + "</ul></div>" +
    '<div class="specs__block"><h3>Tissu &amp; composition</h3><ul>' + sp.fabric.map(function (d) { return "<li>" + S.esc(d) + "</li>"; }).join("") + "</ul></div>";

  /* Textes liés aux dates de précommande */
  var po = S.preorder();
  var heroNote = document.getElementById("hero-preorder");
  if (po.state === "upcoming") heroNote.textContent = "Précommandes ouvertes le " + S.longDate(po.start) + ".";
  else if (po.state === "closed") heroNote.textContent = "Précommandes clôturées. Merci pour votre confiance !";
  else if (po.end) heroNote.textContent = "Précommandes ouvertes jusqu'au " + S.longDate(po.end) + ". Livraison estimée autour du " + S.longDate(po.delivery) + ".";
  else heroNote.textContent = "En précommande. Fabrication puis livraison en " + CFG.deliveryEstimateDays + " jours environ après la clôture.";

  if (po.end) {
    document.getElementById("step-1").textContent =
      "Jusqu'au " + S.longDate(po.end) + ", tu choisis ton modèle, ta couleur et ta taille. Le paiement est sécurisé.";
    document.getElementById("step-3").textContent =
      "Ton t-shirt est expédié et arrive chez toi autour du " + S.longDate(po.delivery) + ".";
    document.getElementById("faq-delivery").textContent =
      "Les précommandes ferment le " + S.longDate(po.end) + ". Viennent ensuite environ " + CFG.productionDays +
      " jours de fabrication et quelques jours de livraison. Tu reçois ton t-shirt autour du " + S.longDate(po.delivery) + ".";
  }
  document.getElementById("step-2").textContent =
    "À la clôture, la production est lancée : environ " + CFG.productionDays + " jours de fabrication et de broderie.";
})();
