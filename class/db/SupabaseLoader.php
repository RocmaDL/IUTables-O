<?php
namespace class\db;

use PDO;
use PDOException;

class SupabaseLoader {
    private static $connection = null;

    public static function getConnection(): PDO {
        $password = ''; 
        $host = '';
        $port = '';
        $dbname = '';
        $user = '';

        if (self::$connection === null) {
            try {
                $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";
                self::$connection = new PDO($dsn, $user, $password);
            } catch (PDOException $e) {
                die("Erreur de connexion à la base de données : " . $e->getMessage());
            }
        }

        return self::$connection;
    }
}
SupabaseLoader::getConnection();