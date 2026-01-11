# Fix Leaflet Icons - Tracking Prevention

## Problème
Les navigateurs modernes bloquent les requêtes vers des CDN externes (comme unpkg.com) à cause des politiques de prévention de suivi (Tracking Prevention). Cela empêche l'affichage des icônes de marqueurs Leaflet.

Erreur dans la console :
```
Tracking Prevention blocked access to storage for https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png
```

## Solution appliquée
Configuration des icônes Leaflet par défaut pour utiliser des fichiers locaux.

### Fichiers locaux ajoutés :
- `public/images/marker-icon.png` - Icône standard
- `public/images/marker-icon-2x.png` - Icône haute résolution
- `public/images/marker-shadow.png` - Ombre du marqueur

### Code modifié dans `CartePage.jsx` :
```javascript
// Configuration globale des icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/marker-icon-2x.png',
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
});
```

Cette approche surcharge les icônes par défaut de Leaflet pour tous les marqueurs.

## Debugging ajouté
- Logs de console pour le chargement des hôpitaux
- Logs pour chaque marker créé
- Message d'attente si aucun hôpital n'est chargé

## Avantages
- ✅ Plus de blocage par les navigateurs
- ✅ Chargement plus rapide (pas de requête externe)
- ✅ Fonctionne hors ligne
- ✅ Contrôle total sur les assets
- ✅ Solution globale (tous les marqueurs utilisent les mêmes icônes)

## Dépannage
Si la carte ne s'affiche toujours pas :

1. **Vérifiez la console** pour les logs de débogage
2. **Serveur backend** : Assurez-vous que l'API `/hopitaux` fonctionne
3. **Base de données** : Vérifiez que les hôpitaux ont des coordonnées (latitude/longitude)
4. **Icônes** : Vérifiez que les fichiers existent dans `public/images/`

## Test
1. Démarrez le serveur backend : `cd server && npm run dev`
2. Démarrez le client : `cd client && npm run dev`
3. Allez sur la page Carte et vérifiez la console pour les logs de débogage

## Géolocalisation ajoutée

### Fonctionnalités :
- **Marqueur rouge** pour la position actuelle de l'utilisateur
- **Centrage automatique** sur la position utilisateur si disponible
- **Indicateur de statut** en bas à gauche de la carte
- **Popup informative** avec coordonnées précises

### Permissions :
La carte demande automatiquement la permission de géolocalisation au chargement. Si refusée, la carte se centre sur le premier hôpital disponible.

### États de géolocalisation :
- 🟢 **Position détectée** : Marqueur rouge affiché
- 🟠 **Permission refusée** : Message informatif
- 🔘 **Recherche en cours** : Indicateur animé

### Code ajouté :
```javascript
// Géolocalisation
navigator.geolocation.getCurrentPosition(
  (position) => setUserLocation([latitude, longitude]),
  (error) => setLocationError(error.message),
  { enableHighAccuracy: true, timeout: 10000 }
);

// Marqueur personnalisé
const userLocationIcon = L.icon({
  // ... configuration rouge
  className: 'user-location-marker'
});
```