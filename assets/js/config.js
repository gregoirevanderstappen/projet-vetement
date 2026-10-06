/*
 * Réglages du site — c'est le SEUL fichier à modifier au quotidien.
 * Voir GUIDE-SHOPIFY.md pour savoir quoi mettre ici.
 */
window.SITE_CONFIG = {
  /* ---- Menu (les trois barres) ----------------------------------------
   * Vérifie que chaque lien correspond bien à une page de ton site actuel.
   */
  siteName: "Grégoire van der Stappen",
  homeUrl: "https://gregoirevanderstappen.com/",
  menu: [
    { label: "Accueil", href: "https://gregoirevanderstappen.com/" },
    { label: "Qui suis-je", href: "https://gregoirevanderstappen.com/qui-suis-je" },
    { label: "Les plâtres", href: "https://gregoirevanderstappen.com/les-platres" },
    { label: "Les bronzes", href: "https://gregoirevanderstappen.com/les-bronzes" },
    { label: "Collection textile", href: "index.html", highlight: true },
    { label: "Contact", href: "https://gregoirevanderstappen.com/contact" }
  ],
  instagram: "",               // ex. "https://instagram.com/ton-compte" (laisser vide pour masquer)
  contactEmail: "",            // ex. "contact@gregoirevanderstappen.com"

  /* ---- Précommande ------------------------------------------------------
   * Dates au format AAAA-MM-JJ. Laisser preorderEnd vide ("") tant que la
   * date n'est pas décidée : le site affichera « Précommandes ouvertes ».
   * Après la date de fin, les boutons passent automatiquement en
   * « Précommandes clôturées ».
   */
  preorderStart: "",
  preorderEnd: "",
  productionDays: 12,          // jours de fabrication après la clôture
  shippingDays: 2,             // jours de livraison
  deliveryEstimateDays: 14,    // délai total annoncé au client (marge comprise)

  /* ---- Shopify ----------------------------------------------------------
   * shopDomain : l'adresse « .myshopify.com » de ta boutique
   * storefrontToken : le jeton PUBLIC « Storefront API » (jamais le jeton Admin !)
   * Tant que ces deux valeurs sont vides, le panier fonctionne mais le
   * bouton de paiement affiche un message « bientôt disponible ».
   */
  shopify: {
    shopDomain: "",            // ex. "gregoire-vds.myshopify.com"
    storefrontToken: "",       // ex. "a1b2c3d4e5f6..."
    apiVersion: "2025-07",
    // Noms des options tels qu'écrits dans Shopify
    colorOptionName: "Couleur",
    sizeOptionName: "Taille"
  }
};
