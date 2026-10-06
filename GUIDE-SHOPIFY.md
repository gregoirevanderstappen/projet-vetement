# Guide : brancher la collection L'Envol sur Shopify

Ce guide part de zéro. Il suit l'ordre à respecter. Compte environ une heure.

Le principe : **le site** (ces fichiers) présente la collection et gère le panier.
Au moment de payer, le client est envoyé sur **la page de paiement sécurisée de
Shopify**. Shopify encaisse l'argent, enregistre les commandes et envoie les
e-mails de confirmation. Tu n'as donc pas besoin d'utiliser le thème
(l'apparence) de Shopify.

---

## Étape 1 — Régler la boutique

Dans l'administration Shopify (`admin.shopify.com`) :

1. **Paramètres → Taxes et droits de douane** : vérifie que l'option
   *« Tous les prix incluent les taxes »* est cochée. Tes prix (49 € et 56 €)
   sont TTC.
2. **Paramètres → Paiements** : active *Shopify Payments*. Il te faudra tes
   informations d'entreprise et ton IBAN.
3. **Paramètres → Expédition et livraison** : crée tes zones (par exemple
   Belgique, France, Europe) et tes tarifs de livraison.
4. **Paramètres → Politiques** : remplis la politique de remboursement, les
   conditions générales de vente, la politique de confidentialité et les
   coordonnées. Shopify propose des modèles. Ajoute dans les CGV une phrase
   sur la précommande, par exemple : *« Les articles sont vendus en
   précommande et fabriqués après la clôture de la période de précommande.
   L'expédition intervient environ 14 jours après cette clôture. »*

## Étape 2 — Créer les 3 produits

**Méthode rapide (recommandée) : importer le fichier tout prêt.**
Dans *Produits*, clique sur **Importer**, choisis `shopify/produits-lenvol.csv`,
puis valide l'import. Les 3 t-shirts sont créés avec leurs 10 variantes
(Blanc/Marine × XS–XL), leurs prix, leurs photos, leur description et la vente
sans stock déjà activée. Passe ensuite directement au point 3 de l'étape 3.

**Méthode manuelle** (si l'import ne fonctionne pas) :

**Produits → Ajouter un produit**, trois fois :

| Titre               | Prix  | Identifiant (handle) |
|---------------------|-------|----------------------|
| L'Envol — Essentiel | 49,00 | `lenvol-essentiel`   |
| L'Envol — Ciel      | 56,00 | `lenvol-ciel`        |
| L'Envol — Dunes     | 56,00 | `lenvol-dunes`       |

Pour chacun :

1. **Variantes** : clique sur *« Ajouter des options comme la taille ou la
   couleur »*. Crée exactement ces deux options :
   - Option `Couleur` avec les valeurs `Blanc` et `Marine`
   - Option `Taille` avec les valeurs `XS`, `S`, `M`, `L`, `XL`

   ⚠️ L'orthographe doit être identique, majuscules et accents compris.
   C'est comme ça que le site retrouve la bonne variante.
2. **Identifiant** : tout en bas de la page, dans *« Référencement sur les
   moteurs de recherche »*, clique sur *Modifier* et mets le handle du tableau
   dans le champ *URL*.
3. **Photos** : ajoute les images du dossier `assets/img/produits/`. Elles
   apparaîtront dans les e-mails de commande.
4. **Stock (précommande)** : pour chaque variante, coche *« Continuer à vendre
   en cas de rupture de stock »* et laisse la quantité à 0. Tu peux aussi
   décocher *« Suivre la quantité »*. Sans cela, Shopify refusera la vente
   puisque tu n'as rien en stock.
5. **Statut** : *Actif*.

## Étape 3 — Obtenir la clé qui relie le site à Shopify

1. Va sur l'App Store de Shopify et installe l'application gratuite
   **« Headless »**, publiée par Shopify.
2. Ouvre-la, puis clique sur *Créer un storefront*.
3. Dans *Accès à l'API Storefront*, copie le **jeton d'accès public**
   (*Public access token*).
   - ⚠️ Ne prends **jamais** le jeton *privé* ni un jeton *Admin*. Seul le
     jeton public peut être mis sur un site.
4. **Très important** : rouvre chacun des 3 produits. Dans *Disponibilité de
   la publication* / *Canaux de vente*, coche le canal **Headless**. Sinon le
   site ne trouvera pas les produits.
5. Note aussi l'adresse de ta boutique en `.myshopify.com`. Tu la trouves
   dans *Paramètres → Domaines*, par exemple `gregoire-vds.myshopify.com`.

## Étape 4 — Remplir `assets/js/config.js`

Ouvre `assets/js/config.js` et complète :

```js
shopify: {
  shopDomain: "gregoire-vds.myshopify.com",   // ton adresse .myshopify.com
  storefrontToken: "colle-ici-le-jeton-public",
  ...
}
```

Dans ce même fichier, mets aussi :

- `preorderStart` et `preorderEnd` : les dates d'ouverture et de clôture
  (format `AAAA-MM-JJ`). Le site calcule et affiche tout seul la date de
  livraison estimée, soit 14 jours après la clôture. Après la date de fin,
  les boutons passent automatiquement en « Précommandes fermées ».
- `contactEmail` et `instagram`.
- les liens du `menu` : vérifie qu'ils pointent vers les bonnes pages de
  ton site actuel.

## Étape 5 — Tester avant d'ouvrir

1. Dans Shopify : **Paramètres → Paiements** → active le *mode test*.
2. Sur le site, ajoute un t-shirt au panier puis clique sur *Valider ma
   précommande*. Tu dois arriver sur la page de paiement Shopify, avec le bon
   modèle, la bonne couleur et la bonne taille.
3. Paie avec la carte de test `4242 4242 4242 4242` (date future, code
   quelconque). La commande apparaît dans *Commandes* avec la mention
   « Précommande ».
4. Désactive le mode test.

## Combien de temps garder les précommandes ouvertes ?

Je conseille **14 jours** :

- 7 jours, c'est court : une partie de ton public ne verra pas l'annonce à
  temps.
- 14 jours, c'est deux week-ends. Ça laisse le temps au bouche-à-oreille,
  tout en gardant l'urgence d'une série limitée.
- Au-delà, l'attente totale devient longue : jusqu'à un mois avant de
  recevoir le t-shirt.

## À la clôture

1. Dans *Commandes*, exporte la liste (bouton *Exporter*). Tu y verras le
   nombre exact de pièces par modèle, couleur et taille. C'est ta commande de
   fabrication, et la donnée qui te dira quel modèle plaît le plus.
2. À l'expédition, marque chaque commande comme *traitée* et ajoute le numéro
   de suivi. Shopify envoie l'e-mail au client automatiquement.
