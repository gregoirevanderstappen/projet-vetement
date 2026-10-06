# L'Envol — collection textile de Grégoire Vanderstappen

Site de présentation et de précommande de la collection de t-shirts **L'Envol**.

- `index.html` : la page de la collection (histoire, modèles, précommande,
  matière, FAQ)
- `produit.html` : la fiche d'un modèle (`produit.html#ciel-marine`)
- `assets/js/config.js` : **les réglages** (menu, dates de précommande, Shopify)
- `assets/js/products.js` : les modèles, les prix, les textes et les photos
- `assets/img/produits/` : les photos, une vue de face (`-avant`) et une vue de
  dos (`-dos`) par modèle et par couleur

Le menu à trois barres en haut à gauche contient tous les onglets du site.

Pour activer le paiement, suis **[GUIDE-SHOPIFY.md](GUIDE-SHOPIFY.md)**.

## Voir le site en local

```sh
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

C'est un site statique, sans compilation. Il s'héberge tel quel sur GitHub
Pages, Netlify ou dans un sous-dossier `/boutique` de ton hébergement actuel.
