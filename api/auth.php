<?php
header("Access-Control-Allow-Origin: http://localhost"); // remplacez par votre domaine exact
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();
// ...existing code...
require_once '../AutoLoader.php';
AutoLoader::register();

use class\db\User;

$action = isset($_GET['action']) ? $_GET['action'] : null;

switch ($action) {
    case 'register':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            try {
                $data = json_decode(file_get_contents("php://input"), true);
                $newId = User::create($data);
                echo json_encode(['id' => $newId, 'message' => 'Utilisateur créé']);
            } catch (\Exception $e) {
                echo json_encode(['error' => $e->getMessage()]);
            }
        } else {
            echo json_encode(['error' => 'Méthode non autorisée']);
        }
        break;

    case 'login':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            try {
                $data = json_decode(file_get_contents("php://input"), true);
                $user = User::getByEmail($data['mail']);
                if ($user && ($data['mdp']== $user['mdp'])) { # Rajouter du hashage
                    // Stocke l'utilisateur en session
                    $_SESSION['user'] = $user;
                    echo json_encode(['message' => 'Authentification réussie', 'user' => $user]);
                } else {
                    echo json_encode(['error' => 'Identifiants incorrects']);
                }
            } catch (\Exception $e) {
                echo json_encode(['error' => $e->getMessage()]);
            }
        } else {
            echo json_encode(['error' => 'Méthode non autorisée']);
        }
        break;
        
    case 'logout':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            unset($_SESSION['user']);  // Supprime l'utilisateur de la session
            session_destroy();
            echo json_encode(['message' => 'Déconnexion réussie']);
        } else {
            echo json_encode(['error' => 'Méthode non autorisée']);
        }
        break;
        
    // Nouvelle action pour vérifier si l’utilisateur est connecté
    case 'isConnected':
        if (isset($_SESSION['user'])) {
            echo json_encode(['connected' => true, 'user' => $_SESSION['user']]);
        } else {
            echo json_encode(['connected' => false]);
        }
        break;

    default:
        echo json_encode(['error' => 'Action non supportée']);
        break;
}
