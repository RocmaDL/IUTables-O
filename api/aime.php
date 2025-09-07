<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once '../AutoLoader.php';
AutoLoader::register();

use class\db\Aime;
/*
id
idU
idR
*/
$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? $_GET['id'] : null;

switch ($method) {
    case 'GET':
        try {
            if ($id) {
                $aime = Aime::getById($id);
                echo json_encode($aime);
            } else {
                $aimeList = Aime::getAll();
                echo json_encode($aimeList);
            }
        } catch (\Exception $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'POST':
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            $newId = Aime::create($data);
            echo json_encode(['id' => $newId]);
        } catch (\Exception $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'PUT':
        try {
            if ($id) {
                $data = json_decode(file_get_contents("php://input"), true);
                $updateCount = Aime::update($id, $data);
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
            $data = json_decode(file_get_contents("php://input"), true);
            if (isset($data['idR'])) {
                session_start();
                $userId = isset($_SESSION['user']['id']) ? $_SESSION['user']['id'] : null;
                if (!$userId) {
                    echo json_encode(['error' => 'Utilisateur non authentifié']);
                    exit;
                }
                // Suppression du favori pour cet utilisateur et ce restaurant
                $deleteCount = Aime::deleteFavorite($userId, $data['idR']);
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
