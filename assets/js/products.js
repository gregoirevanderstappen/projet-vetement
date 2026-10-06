/*
 * Catalogue de la collection « L'Envol ».
 * `handle` = l'identifiant du produit dans Shopify (voir GUIDE-SHOPIFY.md).
 */
window.COLLECTION = {
  name: "L'Envol",
  sizes: ["XS", "S", "M", "L", "XL"],
  colors: {
    blanc: { label: "Blanc", swatch: "#f7f6f2" },
    marine: { label: "Marine", swatch: "#1f2a44" }
  },
  specs: {
    weight: "180 g/m²",
    fit: "Medium Fit",
    sizes: "XS – XL",
    details: [
      "Côte 1x1 au col",
      "Bande de propreté intérieur col dans la matière principale",
      "Manches montées",
      "Surpiqûre double large en bas de manches et bas de corps"
    ],
    fabric: [
      "Single Jersey",
      "100 % coton : 70 % coton biologique, 30 % coton recyclé",
      "Combed Ring Spun",
      "Fabric washed"
    ]
  },
  products: [
    {
      id: "essentiel",
      handle: "lenvol-essentiel",
      name: "L'Envol — Essentiel",
      price: 49,
      cover: 0, // image affichée en premier dans la grille : 0 = face, 1 = dos
      tagline: "Broderie seule, au cœur",
      front: "Broderie de L'Envol, côté cœur",
      back: "Dos nu",
      description:
        "La version la plus pure. Le petit personnage de L'Envol est brodé côté cœur, fil à fil, comme une signature. Rien au dos : seulement le geste, discret, de celui qui s'apprête à quitter le sol.",
      images: {
        blanc: ["essentiel-blanc-avant.jpg", "essentiel-blanc-dos.jpg"],
        marine: ["essentiel-marine-avant.jpg", "essentiel-marine-dos.jpg"]
      }
    },
    {
      id: "ciel",
      handle: "lenvol-ciel",
      name: "L'Envol — Ciel",
      price: 56,
      cover: 1,
      tagline: "Broderie + aquarelle « Ciel » au dos",
      front: "Broderie de L'Envol, côté cœur",
      back: "Impression de l'aquarelle « Ciel »",
      description:
        "Au dos, une aquarelle originale : un ciel bleu lavé, une mer de ballons aux couleurs franches, et L'Envol qui s'élève au-dessus. Les ballons, c'est l'enfance ; le ciel, c'est la liberté qu'on s'autorise enfin à prendre.",
      images: {
        blanc: ["ciel-blanc-avant.jpg", "ciel-blanc-dos.jpg"],
        marine: ["ciel-marine-avant.jpg", "ciel-marine-dos.jpg"]
      }
    },
    {
      id: "dunes",
      handle: "lenvol-dunes",
      name: "L'Envol — Dunes",
      price: 56,
      cover: 1,
      tagline: "Broderie + aquarelle « Dunes » au dos",
      front: "Broderie de L'Envol, côté cœur",
      back: "Impression de l'aquarelle « Dunes »",
      description:
        "Au dos, une aquarelle originale aux tons de sable : des dunes en relief, un soleil rouge posé à l'horizon, et L'Envol qui s'en va vers un nouveau jour. Une image calme pour un nouveau départ.",
      images: {
        blanc: ["dunes-blanc-avant.jpg", "dunes-blanc-dos.jpg"],
        marine: ["dunes-marine-avant.jpg", "dunes-marine-dos.jpg"]
      }
    }
  ]
};
