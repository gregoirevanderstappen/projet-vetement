/* Fiche produit (produit.html#modele-couleur, ex. produit.html#ciel-marine) */
(function () {
  "use strict";

  var COL = window.COLLECTION;
  var S = window.Shop;
  var IMG = "assets/img/produits/";

  var hash = location.hash.slice(1).split("-");
  var p = S.findProduct(hash[0]) || COL.products[0];
  var color = p.images[hash[1]] ? hash[1] : Object.keys(p.images)[0];
  var size = null;
  var view = 0;

  document.title = p.name + " | Grégoire van der Stappen";
  document.getElementById("crumb-name").textContent = p.name;

  var root = document.getElementById("product");
  var closed = S.preorder().state !== "open";

  root.innerHTML =
    '<div class="gallery">' +
      '<div class="gallery__main"><img id="main-img" alt=""><span class="tag">Précommande</span></div>' +
      '<div class="gallery__thumbs" id="thumbs"></div>' +
    "</div>" +
    '<div class="buy">' +
      '<p class="eyebrow">Collection ' + S.esc(COL.name) + "</p>" +
      '<h1 class="title">' + S.esc(p.name) + "</h1>" +
      '<p class="buy__price">' + S.euro(p.price) + ' <span>TTC</span></p>' +
      '<div class="notice"><strong>Précommande.</strong> ' + S.esc(S.deliverySentence()) + "</div>" +
      '<p class="buy__desc">' + S.esc(p.description) + "</p>" +

      '<fieldset class="opt"><legend>Couleur : <span id="color-label"></span></legend><div class="swatches swatches--lg" id="colors"></div></fieldset>' +
      '<fieldset class="opt"><legend>Taille <span class="opt__hint">Medium Fit : prends ta taille habituelle</span></legend><div class="sizes" id="sizes"></div></fieldset>' +

      '<button class="btn btn--full" id="add" type="button"' + (closed ? " disabled" : "") + ">" +
        (closed ? "Précommandes fermées" : "Précommander — " + S.euro(p.price)) + "</button>" +
      '<p class="buy__error" id="add-error" role="alert"></p>' +

      '<div class="acc">' +
        '<details open><summary>Le design</summary><ul>' +
          "<li><strong>Avant :</strong> " + S.esc(p.front) + "</li>" +
          "<li><strong>Dos :</strong> " + S.esc(p.back) + "</li>" +
        "</ul></details>" +
        '<details><summary>Matière &amp; coupe</summary><ul>' +
          "<li>" + COL.specs.weight + " · " + COL.specs.fit + " · " + COL.specs.sizes + "</li>" +
          COL.specs.fabric.map(function (f) { return "<li>" + S.esc(f) + "</li>"; }).join("") +
          COL.specs.details.map(function (f) { return "<li>" + S.esc(f) + "</li>"; }).join("") +
        "</ul></details>" +
        '<details><summary>Précommande &amp; livraison</summary><p>' +
          "Ce t-shirt n'est pas en stock : il est fabriqué pour toi après la clôture des précommandes. " +
          "Compte environ " + window.SITE_CONFIG.productionDays + " jours de fabrication, puis la livraison. " +
          "Tu reçois un e-mail dès l'expédition.</p></details>" +
      "</div>" +
    "</div>";

  /* Couleurs */
  var colorsEl = document.getElementById("colors");
  colorsEl.innerHTML = Object.keys(p.images).map(function (c) {
    return '<button type="button" class="swatch" data-color="' + c + '" style="--sw:' + COL.colors[c].swatch + '" aria-label="' + S.esc(COL.colors[c].label) + '"></button>';
  }).join("");
  colorsEl.addEventListener("click", function (e) {
    var b = e.target.closest(".swatch");
    if (!b) return;
    color = b.dataset.color;
    history.replaceState(null, "", "#" + p.id + "-" + color);
    paint();
  });

  /* Tailles */
  var sizesEl = document.getElementById("sizes");
  sizesEl.innerHTML = COL.sizes.map(function (s) {
    return '<button type="button" class="size" data-size="' + s + '" aria-pressed="false">' + s + "</button>";
  }).join("");
  sizesEl.addEventListener("click", function (e) {
    var b = e.target.closest(".size");
    if (!b) return;
    size = b.dataset.size;
    document.getElementById("add-error").textContent = "";
    sizesEl.querySelectorAll(".size").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
  });

  /* Galerie */
  var thumbs = document.getElementById("thumbs");
  thumbs.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    view = +b.dataset.view;
    paint();
  });

  function paint() {
    var imgs = p.images[color];
    var main = document.getElementById("main-img");
    main.src = IMG + imgs[view];
    main.alt = p.name + ", " + COL.colors[color].label.toLowerCase() + ", vue " + (view === 0 ? "de face" : "de dos");
    thumbs.innerHTML = imgs.map(function (src, i) {
      return '<button type="button" data-view="' + i + '" aria-pressed="' + (i === view) + '" aria-label="Vue ' + (i === 0 ? "de face" : "de dos") + '">' +
        '<img src="' + IMG + src + '" alt=""><span>' + (i === 0 ? "Face" : "Dos") + "</span></button>";
    }).join("");
    document.getElementById("color-label").textContent = COL.colors[color].label;
    colorsEl.querySelectorAll(".swatch").forEach(function (s) {
      var on = s.dataset.color === color;
      s.classList.toggle("is-active", on);
      s.setAttribute("aria-pressed", on);
    });
  }
  paint();

  /* Ajout au panier */
  document.getElementById("add").addEventListener("click", function () {
    if (!size) {
      document.getElementById("add-error").textContent = "Choisis d'abord ta taille.";
      sizesEl.querySelector(".size").focus();
      return;
    }
    S.addToCart(p.id, color, size, 1);
  });

  /* Autres modèles */
  document.getElementById("more").innerHTML = COL.products.filter(function (x) { return x.id !== p.id; }).map(function (x) {
    var c = x.images[color] ? color : Object.keys(x.images)[0];
    return '<a class="card card--link" href="produit.html#' + x.id + "-" + c + '">' +
      '<span class="card__media"><img class="card__front" src="' + IMG + x.images[c][x.cover] + '" alt="' + S.esc(x.name) + '" loading="lazy">' +
      '<img class="card__back" src="' + IMG + x.images[c][1 - x.cover] + '" alt="" loading="lazy"></span>' +
      '<span class="card__body"><span class="card__row"><span class="card__name">' + S.esc(x.name) + "</span>" +
      '<span class="card__price">' + S.euro(x.price) + "</span></span>" +
      '<span class="card__tag">' + S.esc(x.tagline) + "</span></span></a>";
  }).join("");
  window.addEventListener("hashchange", function () { location.reload(); });
})();
