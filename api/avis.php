<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once '../AutoLoader.php';
AutoLoader::register();

use class\db\Avis;
/*
idU
idR
note
critique
*/
$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? $_GET['id'] : null;
$idU = isset($_GET['idU']) ? $_GET['idU'] : null;
$idR = isset($_GET['idR']) ? $_GET['idR'] : null;

switch ($method) {
    case 'GET':
        try {
            if ($id) {
                $avis = Avis::getById($id);
                echo json_encode($avis);
            } elseif ($idU) {
                $avisList = Avis::getByUser($idU);
                echo json_encode($avisList);
            } elseif ($idR) {
                $avisList = Avis::getByRestaurant($idR);
                echo json_encode($avisList);
            } else {
                $avisList = Avis::getAll();
                echo json_encode($avisList);
            }
        } catch (\Exception $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'POST':
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            // Démarrer la session et assigner idU si absent
            session_start();
            if (!isset($data['idU']) && isset($_SESSION['user']['id'])) {
                $data['idU'] = $_SESSION['user']['id'];
            }
            $newId = Avis::create($data);
            echo json_encode(['id' => $newId]);
        } catch (\Exception $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'PUT':
        try {
            if ($id) {
                $data = json_decode(file_get_contents("php://input"), true);
                $updateCount = Avis::update($id, $data);
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
                $deleteCount = Avis::delete($id);
                echo json_encode(['deleted' => $deleteCount]);
            } else {
                echo json_encode(['error' => 'ID manquant']);
            }
        } catch (\Exception $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    default:
        echo json_encode(['error' => 'Méthode non supportée']);
        break;
}
