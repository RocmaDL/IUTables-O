<?php
namespace class\db;

use PDO;
use Exception;

class Restaurant {
    public $id;
    public $geo_point_2d;
    public $geo_shape;
    public $osm_id;
    public $type;
    public $name;
    public $operator;
    public $brand;
    public $opening_hours;
    public $wheelchair;
    public $cuisine;
    public $vegetarian;
    public $vegan;
    public $delivery;
    public $takeaway;
    public $internet_access;
    public $stars;
    public $capacity;
    public $drive_through;
    public $wikidata;
    public $brand_wikidata;
    public $siret;
    public $phone;
    public $website;
    public $facebook;
    public $smoking;
    public $com_insee;
    public $com_nom;
    public $region;
    public $code_region;
    public $departement;
    public $code_departement;
    public $commune;
    public $code_commune;
    public $osm_edit;

    public function __construct(
        $id = null,
        $geo_point_2d = null,
        $geo_shape = null,
        $osm_id = null,
        $type = null,
        $name = null,
        $operator = null,
        $brand = null,
        $opening_hours = null,
        $wheelchair = null,
        $cuisine = null,
        $vegetarian = null,
        $vegan = null,
        $delivery = null,
        $takeaway = null,
        $internet_access = null,
        $stars = null,
        $capacity = null,
        $drive_through = null,
        $wikidata = null,
        $brand_wikidata = null,
        $siret = null,
        $phone = null,
        $website = null,
        $facebook = null,
        $smoking = null,
        $com_insee = null,
        $com_nom = null,
        $region = null,
        $code_region = null,
        $departement = null,
        $code_departement = null,
        $commune = null,
        $code_commune = null,
        $osm_edit = null
    ) {
        $this->id = $id;
        $this->geo_point_2d = $geo_point_2d;
        $this->geo_shape = $geo_shape;
        $this->osm_id = $osm_id;
        $this->type = $type;
        $this->name = $name;
        $this->operator = $operator;
        $this->brand = $brand;
        $this->opening_hours = $opening_hours;
        $this->wheelchair = $wheelchair;
        $this->cuisine = $cuisine;
        $this->vegetarian = $vegetarian;
        $this->vegan = $vegan;
        $this->delivery = $delivery;
        $this->takeaway = $takeaway;
        $this->internet_access = $internet_access;
        $this->stars = $stars;
        $this->capacity = $capacity;
        $this->drive_through = $drive_through;
        $this->wikidata = $wikidata;
        $this->brand_wikidata = $brand_wikidata;
        $this->siret = $siret;
        $this->phone = $phone;
        $this->website = $website;
        $this->facebook = $facebook;
        $this->smoking = $smoking;
        $this->com_insee = $com_insee;
        $this->com_nom = $com_nom;
        $this->region = $region;
        $this->code_region = $code_region;
        $this->departement = $departement;
        $this->code_departement = $code_departement;
        $this->commune = $commune;
        $this->code_commune = $code_commune;
        $this->osm_edit = $osm_edit;
    }

    // Ajout d'une fonction d'assistance pour le binding
    private static function safeBind($value) {
        return is_array($value) ? json_encode($value) : $value;
    }

    // Nouvelle fonction pour convertir un tableau en littéral de tableau PostgreSQL
    private static function convertToPgArray($array) {
        if (!is_array($array)) {
            return $array;
        }
        $escaped = array_map(function($elem) {
            // Ajoute des guillemets autour de chaque élément en échappant les guillemets internes
            return '"' . str_replace('"', '\"', $elem) . '"';
        }, $array);
        return '{' . implode(',', $escaped) . '}';
    }

    public static function getAll() {
        $connection = SupabaseLoader::getConnection();
        $sql = "SELECT * FROM restaurant";
        $resultset = $connection->prepare($sql);
        $resultset->execute();
        return $resultset->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function getById($id) {
        $connection = SupabaseLoader::getConnection();
        $sql = "SELECT * FROM restaurant WHERE id = :id";
        $resultset = $connection->prepare($sql);
        $resultset->bindParam(':id', $id);
        $resultset->execute();
        return $resultset->fetch(PDO::FETCH_ASSOC);
    }

    public static function create($data) {
        $connection = SupabaseLoader::getConnection();
        $sql = "INSERT INTO restaurant (
            geo_point_2d, geo_shape, osm_id, type, name, operator, brand, opening_hours, wheelchair, cuisine,
            vegetarian, vegan, delivery, takeaway, internet_access, stars, capacity, drive_through, wikidata,
            brand_wikidata, siret, phone, website, facebook, smoking, com_insee, com_nom, region, code_region,
            departement, code_departement, commune, code_commune, osm_edit
        ) VALUES (
            :geo_point_2d, :geo_shape, :osm_id, :type, :name, :operator, :brand, :opening_hours, :wheelchair, :cuisine,
            :vegetarian, :vegan, :delivery, :takeaway, :internet_access, :stars, :capacity, :drive_through, :wikidata,
            :brand_wikidata, :siret, :phone, :website, :facebook, :smoking, :com_insee, :com_nom, :region, :code_region,
            :departement, :code_departement, :commune, :code_commune, :osm_edit
        )";
        $stmt = $connection->prepare($sql);
        // Utilisation de safeBind pour les champs JSON
        $stmt->bindValue(':geo_point_2d', self::safeBind($data['geo_point_2d']), PDO::PARAM_STR);
        $stmt->bindValue(':geo_shape', self::safeBind($data['geo_shape']), PDO::PARAM_STR);
        // Conversion pour les colonnes PostgreSQL array
        $stmt->bindValue(':cuisine', self::convertToPgArray($data['cuisine']), PDO::PARAM_STR);
        $stmt->bindValue(':internet_access', self::convertToPgArray($data['internet_access']), PDO::PARAM_STR);
        // ...binding des autres paramètres...
        $stmt->bindParam(':osm_id', $data['osm_id']);
        $stmt->bindParam(':type', $data['type']);
        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':operator', $data['operator']);
        $stmt->bindParam(':brand', $data['brand']);
        $stmt->bindParam(':opening_hours', $data['opening_hours']);
        $stmt->bindParam(':wheelchair', $data['wheelchair']);
        $stmt->bindParam(':vegetarian', $data['vegetarian']);
        $stmt->bindParam(':vegan', $data['vegan']);
        $stmt->bindParam(':delivery', $data['delivery']);
        $stmt->bindParam(':takeaway', $data['takeaway']);
        $stmt->bindParam(':stars', $data['stars']);
        $stmt->bindParam(':capacity', $data['capacity']);
        $stmt->bindParam(':drive_through', $data['drive_through']);
        $stmt->bindParam(':wikidata', $data['wikidata']);
        $stmt->bindParam(':brand_wikidata', $data['brand_wikidata']);
        $stmt->bindParam(':siret', $data['siret']);
        $stmt->bindParam(':phone', $data['phone']);
        $stmt->bindParam(':website', $data['website']);
        $stmt->bindParam(':facebook', $data['facebook']);
        $stmt->bindParam(':smoking', $data['smoking']);
        $stmt->bindParam(':com_insee', $data['com_insee']);
        $stmt->bindParam(':com_nom', $data['com_nom']);
        $stmt->bindParam(':region', $data['region']);
        $stmt->bindParam(':code_region', $data['code_region']);
        $stmt->bindParam(':departement', $data['departement']);
        $stmt->bindParam(':code_departement', $data['code_departement']);
        $stmt->bindParam(':commune', $data['commune']);
        $stmt->bindParam(':code_commune', $data['code_commune']);
        $stmt->bindParam(':osm_edit', $data['osm_edit']);
        $stmt->execute();
        return $connection->lastInsertId();
    }

    public static function update($id, $data) {
        $connection = SupabaseLoader::getConnection();
        $sql = "UPDATE restaurant SET 
            geo_point_2d = :geo_point_2d, geo_shape = :geo_shape, osm_id = :osm_id, type = :type, name = :name, 
            operator = :operator, brand = :brand, opening_hours = :opening_hours, wheelchair = :wheelchair, cuisine = :cuisine,
            vegetarian = :vegetarian, vegan = :vegan, delivery = :delivery, takeaway = :takeaway, internet_access = :internet_access,
            stars = :stars, capacity = :capacity, drive_through = :drive_through, wikidata = :wikidata, brand_wikidata = :brand_wikidata,
            siret = :siret, phone = :phone, website = :website, facebook = :facebook, smoking = :smoking,
            com_insee = :com_insee, com_nom = :com_nom, region = :region, code_region = :code_region, departement = :departement,
            code_departement = :code_departement, commune = :commune, code_commune = :code_commune, osm_edit = :osm_edit
            WHERE id = :id";
        $stmt = $connection->prepare($sql);
        $stmt->bindValue(':geo_point_2d', self::safeBind($data['geo_point_2d']), PDO::PARAM_STR);
        $stmt->bindValue(':geo_shape', self::safeBind($data['geo_shape']), PDO::PARAM_STR);
        $stmt->bindValue(':cuisine', self::convertToPgArray($data['cuisine']), PDO::PARAM_STR);
        $stmt->bindValue(':internet_access', self::convertToPgArray($data['internet_access']), PDO::PARAM_STR);
        // ...binding des autres paramètres...
        $stmt->bindParam(':osm_id', $data['osm_id']);
        $stmt->bindParam(':type', $data['type']);
        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':operator', $data['operator']);
        $stmt->bindParam(':brand', $data['brand']);
        $stmt->bindParam(':opening_hours', $data['opening_hours']);
        $stmt->bindParam(':wheelchair', $data['wheelchair']);
        $stmt->bindParam(':cuisine', $data['cuisine']);
        $stmt->bindParam(':vegetarian', $data['vegetarian']);
        $stmt->bindParam(':vegan', $data['vegan']);
        $stmt->bindParam(':delivery', $data['delivery']);
        $stmt->bindParam(':takeaway', $data['takeaway']);
        $stmt->bindParam(':internet_access', $data['internet_access']);
        $stmt->bindParam(':stars', $data['stars']);
        $stmt->bindParam(':capacity', $data['capacity']);
        $stmt->bindParam(':drive_through', $data['drive_through']);
        $stmt->bindParam(':wikidata', $data['wikidata']);
        $stmt->bindParam(':brand_wikidata', $data['brand_wikidata']);
        $stmt->bindParam(':siret', $data['siret']);
        $stmt->bindParam(':phone', $data['phone']);
        $stmt->bindParam(':website', $data['website']);
        $stmt->bindParam(':facebook', $data['facebook']);
        $stmt->bindParam(':smoking', $data['smoking']);
        $stmt->bindParam(':com_insee', $data['com_insee']);
        $stmt->bindParam(':com_nom', $data['com_nom']);
        $stmt->bindParam(':region', $data['region']);
        $stmt->bindParam(':code_region', $data['code_region']);
        $stmt->bindParam(':departement', $data['departement']);
        $stmt->bindParam(':code_departement', $data['code_departement']);
        $stmt->bindParam(':commune', $data['commune']);
        $stmt->bindParam(':code_commune', $data['code_commune']);
        $stmt->bindParam(':osm_edit', $data['osm_edit']);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->rowCount();
    }

    public static function delete($id) {
        $connection = SupabaseLoader::getConnection();
        $sql = "DELETE FROM restaurant WHERE id = :id";
        $stmt = $connection->prepare($sql);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->rowCount();
    }

    // Nouvelle méthode pour obtenir les restaurants paginés
    public static function getPaginated($page, $limit) {
        $connection = SupabaseLoader::getConnection();
        $offset = ($page - 1) * $limit;
        $sql = "SELECT * FROM restaurant LIMIT :limit OFFSET :offset";
        $stmt = $connection->prepare($sql);
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
