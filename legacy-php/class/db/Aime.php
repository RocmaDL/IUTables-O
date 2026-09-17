<?php
namespace class\db;

use PDO;
use Exception;

class Aime {
    public $id;
    public $idR;
    public $idU;
    
    public function __construct($id = null, $idR = null, $idU = null) {
        $this->id = $id;
        $this->idR = $idR;
        $this->idU = $idU;
    }

    public static function getAll() {
        $connection = SupabaseLoader::getConnection();
        $sql = "SELECT * FROM aime";
        $stmt = $connection->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public static function getById($id) {
        $connection = SupabaseLoader::getConnection();
        $sql = "SELECT * FROM aime WHERE id = :id";
        $stmt = $connection->prepare($sql);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public static function create($data) {
        $connection = SupabaseLoader::getConnection();
        // Utiliser des guillemets doubles pour conserver la casse
        $sql = "INSERT INTO aime (\"idR\", \"idU\") VALUES (:idR, :idU)";
        $stmt = $connection->prepare($sql);
        $stmt->bindParam(':idR', $data['idR']);
        $stmt->bindParam(':idU', $data['idU']);
        $stmt->execute();
        return $connection->lastInsertId();
    }
    
    public static function update($id, $data) {
        $connection = SupabaseLoader::getConnection();
        // Utiliser des guillemets doubles pour conserver la casse
        $sql = "UPDATE aime SET \"idR\" = :idR, \"idU\" = :idU WHERE id = :id";
        $stmt = $connection->prepare($sql);
        $stmt->bindParam(':idR', $data['idR']);
        $stmt->bindParam(':idU', $data['idU']);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->rowCount();
    }
    
    public static function delete($id) {
        $connection = SupabaseLoader::getConnection();
        $sql = "DELETE FROM aime WHERE id = :id";
        $stmt = $connection->prepare($sql);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->rowCount();
    }
    
    // Nouvelle méthode pour supprimer un favori pour un utilisateur et un restaurant donnés
    public static function deleteFavorite($userId, $idR) {
        $connection = SupabaseLoader::getConnection();
        // Utiliser des guillemets doubles pour conserver la casse
        $sql = "DELETE FROM aime WHERE \"idU\" = :idU AND \"idR\" = :idR";
        $stmt = $connection->prepare($sql);
        $stmt->bindParam(':idU', $userId, PDO::PARAM_INT);
        $stmt->bindParam(':idR', $idR, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->rowCount();
    }
}
