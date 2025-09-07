<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set('display_errors', 1);

// ...existing code...
require_once '../AutoLoader.php';
AutoLoader::register();

use class\db\User;
/**
 * id
 * nom
 * prenom
 * mail
 * mdp
 * telephone
 */
$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? $_GET['id'] : null;

switch ($method) {
    case 'GET':
        try {
            if ($id) {
                $user = User::getById($id);
                echo json_encode($user);
            } else {
                $users = User::getAll();
                echo json_encode($users);
            }
        } catch (\Exception $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'POST':
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            // Hachage du mot de passe pour la création
            $newId = User::create($data);
            echo json_encode(['id' => $newId, 'message' => 'Utilisateur créé']);
        } catch (\Exception $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'PUT':
        try {
            if ($id) {
                $data = json_decode(file_get_contents("php://input"), true);
                // On suppose le mot de passe est déjà haché ou on le hache à nouveau si nécessaire
                $updateCount = User::update($id, $data);
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
                $deleteCount = User::delete($id);
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
