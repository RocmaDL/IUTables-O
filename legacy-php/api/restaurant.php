<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once '../AutoLoader.php';
AutoLoader::register();

use class\db\Restaurant;
/*
id
geo_shape
osm_id
type
name
operator
brand
opening_hours
wheelchair
cuisine
vegetarian
vegan
delivery
takeaway
internet_access
stars
capacity
drive_through
wikidata
brand_wikidata
siret
phone
website
facebook
smoking
com_insee
com_nom
region
code_region
departement
code_departement
commune
code_commune
osm_edit
*/

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? $_GET['id'] : null;

switch ($method) {
    case 'GET':
        try {
            if ($id) {
                $restaurant = Restaurant::getById($id);
                echo json_encode($restaurant);
            } elseif (isset($_GET['page']) || isset($_GET['limit'])) {
                // Nouvelle route GET paginée
                $page = isset($_GET['page']) && intval($_GET['page']) > 0 ? intval($_GET['page']) : 1;
                $limit = isset($_GET['limit']) && intval($_GET['limit']) > 0 ? intval($_GET['limit']) : 10;
                $restaurants = Restaurant::getPaginated($page, $limit);
                echo json_encode($restaurants);
            } else {
                $restaurants = Restaurant::getAll();
                echo json_encode($restaurants);
            }
        } catch (\Exception $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'POST':
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            $newId = Restaurant::create($data);
            echo json_encode(['id' => $newId]);
        } catch (\Exception $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'PUT':
        try {
            if ($id) {
                $data = json_decode(file_get_contents("php://input"), true);
                $updateCount = Restaurant::update($id, $data);
                echo json_encode(['updated' => $updateCount]);
            } else {
                echo json_encode(['error' => 'ID manquant']);
            }
        } catch (\Exception $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        try {
            if ($id) {
                $deleteCount = Restaurant::delete($id);
                echo json_encode(['deleted' => $deleteCount]);
            } else {
                echo json_encode(['error' => 'ID manquant']);
            }
        } catch (\Exception $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    default:
        echo json_encode(["error" => "Méthode non supportée"]);
        break;
}
