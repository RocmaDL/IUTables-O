<?php
namespace class\db;

use PDO;
use Exception;

class User {
    public $id;
    public $nom;
    public $prenom;
    public $mail;
    public $mdp;
    public $telephone;

    public function __construct($id = null, $nom = '', $prenom = '', $mail = '', $mdp = '', $telephone = '') {
        $this->id = $id;
        $this->nom = $nom;
        $this->prenom = $prenom;
        $this->mail = $mail;
        $this->mdp = $mdp;
        $this->telephone = $telephone;
    }

    public static function create($data) {
        $connection = SupabaseLoader::getConnection();
        $sql = "INSERT INTO utilisateur (nom, prenom, mail, mdp, telephone)
                VALUES (:nom, :prenom, :mail, :mdp, :telephone)";
        $stmt = $connection->prepare($sql);
        $stmt->bindParam(':nom', $data['nom']);
        $stmt->bindParam(':prenom', $data['prenom']);
        $stmt->bindParam(':mail', $data['mail']);
        $stmt->bindParam(':mdp', $data['mdp']);
        $stmt->bindParam(':telephone', $data['telephone']);
        $stmt->execute();
        return $connection->lastInsertId();
    }

    public static function getByEmail($mail) {
        $connection = SupabaseLoader::getConnection();
        $sql = "SELECT * FROM utilisateur WHERE mail = :mail";
        $stmt = $connection->prepare($sql);
        $stmt->bindParam(':mail', $mail);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public static function getById($id) {
        $connection = SupabaseLoader::getConnection();
        $sql = "SELECT * FROM utilisateur WHERE id = :id";
        $stmt = $connection->prepare($sql);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public static function getAll() {
        $connection = SupabaseLoader::getConnection();
        $sql = "SELECT * FROM utilisateur";
        $stmt = $connection->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function update($id, $data) {
        $connection = SupabaseLoader::getConnection();
        $sql = "UPDATE utilisateur SET 
                    nom = :nom, prenom = :prenom, mail = :mail, mdp = :mdp, telephone = :telephone
                WHERE id = :id";
        $stmt = $connection->prepare($sql);
        $stmt->bindParam(':nom', $data['nom']);
        $stmt->bindParam(':prenom', $data['prenom']);
        $stmt->bindParam(':mail', $data['mail']);
        $stmt->bindParam(':mdp', $data['mdp']);
        $stmt->bindParam(':telephone', $data['telephone']);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->rowCount();
    }

    public static function delete($id) {
        $connection = SupabaseLoader::getConnection();
        $sql = "DELETE FROM utilisateur WHERE id = :id";
        $stmt = $connection->prepare($sql);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->rowCount();
    }
}
