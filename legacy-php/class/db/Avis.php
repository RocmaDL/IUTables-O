<?php
namespace class\db;

use PDO;
use Exception;

class Avis {
    public $id;
    public $idU;
    public $idR;
    public $note;
    public $critique;

    public function __construct($id = null, $idU = null, $idR = null, $note = null, $critique = '') {
        $this->id = $id;
        $this->idU = $idU;
        $this->idR = $idR;
        $this->note = $note;
        $this->critique = $critique;
    }

    public static function getAll() {
        $connection = SupabaseLoader::getConnection();
        $sql = "SELECT * FROM avis";
        $stmt = $connection->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function getById($id) {
        $connection = SupabaseLoader::getConnection();
        $sql = "SELECT * FROM avis WHERE id = :id";
        $stmt = $connection->prepare($sql);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public static function create($data) {
        $connection = SupabaseLoader::getConnection();
        // Utiliser des guillemets doubles pour conserver la casse dans PostgreSQL
        // Remplacez "id" par le nom réel de la colonne identifiant, par exemple "idAvis"
        $sql = "INSERT INTO avis (\"idU\", \"idR\", \"note\", \"critique\") VALUES (:idU, :idR, :note, :critique)";
        $stmt = $connection->prepare($sql);
        $stmt->bindParam(':idU', $data['idU']);
        $stmt->bindParam(':idR', $data['idR']);
        $stmt->bindParam(':note', $data['note']);
        $stmt->bindParam(':critique', $data['critique']);
        $stmt->execute();
        return $stmt->fetchColumn();
    }

    public static function update($id, $data) {
        $connection = SupabaseLoader::getConnection();
        $sql = "UPDATE avis SET idU = :idU, idR = :idR, note = :note, critique = :critique
                WHERE id = :id";
        $stmt = $connection->prepare($sql);
        $stmt->bindParam(':idU', $data['idU']);
        $stmt->bindParam(':idR', $data['idR']);
        $stmt->bindParam(':note', $data['note']);
        $stmt->bindParam(':critique', $data['critique']);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->rowCount();
    }

    public static function delete($id) {
        $connection = SupabaseLoader::getConnection();
        $sql = "DELETE FROM avis WHERE id = :id";
        $stmt = $connection->prepare($sql);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->rowCount();
    }

    // Nouvelle méthode pour récupérer les avis d'un utilisateur
    public static function getByUser($idU) {
        $connection = SupabaseLoader::getConnection();
        $sql = "SELECT * FROM avis WHERE idU = :idU";
        $stmt = $connection->prepare($sql);
        $stmt->bindParam(':idU', $idU);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Nouvelle méthode pour récupérer les avis d'un restaurant
    public static function getByRestaurant($idR) {
        $connection = SupabaseLoader::getConnection();
        // Encadrez "idR" de guillemets doubles pour préserver la casse
        $sql = "SELECT * FROM avis WHERE \"idR\" = :idR";
        $stmt = $connection->prepare($sql);
        $stmt->bindParam(':idR', $idR, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Nouvelle méthode pour mettre à jour un avis en utilisant la clé composite (idU, idR)
    public static function updateByComposite($data) {
        $connection = SupabaseLoader::getConnection();
        $sql = "UPDATE avis SET \"note\" = :note, \"critique\" = :critique WHERE \"idU\" = :idU AND \"idR\" = :idR";
        $stmt = $connection->prepare($sql);
        $stmt->bindParam(':note', $data['note']);
        $stmt->bindParam(':critique', $data['critique']);
        $stmt->bindParam(':idU', $data['idU'], PDO::PARAM_INT);
        $stmt->bindParam(':idR', $data['idR'], PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->rowCount();
    }
}
