<?php
require_once 'AutoLoader.php';
AutoLoader::register();

use class\db\Restaurant;

// Chemin du fichier JSON
$jsonFile = __DIR__ . '/loadjson/restaurants_orleans.json';
if (!file_exists($jsonFile)) {
    die("Fichier JSON non trouvé : " . $jsonFile);
}

// Lecture et décodage du fichier JSON
$jsonData = json_decode(file_get_contents($jsonFile), true);
if (!$jsonData) {
    die("Erreur de décodage du JSON.");
}

// Parcours de chaque restaurant et insertion
foreach ($jsonData as $restaurantData) {
    try {
        // Insertion dans la table restaurant via le modèle
        $newId = Restaurant::create($restaurantData);
        echo "Restaurant inséré avec l'ID : $newId\n";
    } catch (Exception $e) {
        echo "Erreur lors de l'insertion : " . $e->getMessage() . "\n";
    }
}
