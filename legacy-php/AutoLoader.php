<?php

class AutoLoader {
    public static function register() {
        spl_autoload_register(array(__CLASS__, 'autoload'));
    }

    public static function autoload($fqcn) {
        $file = __DIR__ . '/' . str_replace('\\', '/', $fqcn) . '.php';

        if (file_exists($file)) {
            require $file;
        } else {
            throw new Exception("Erreur : Impossible de charger la classe. Fichier introuvable : $file");
        }
    }
}
