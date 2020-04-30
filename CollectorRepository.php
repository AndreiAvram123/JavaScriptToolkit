<?php

require_once "Database.php";

class CollectorRepository
{
    private static $instance = null;
    private $dbHandle;

    public static function getInstance()
    {
        if (self::$instance == null) {
            self::$instance = new CollectorRepository();
        }
        return self::$instance;
    }

    public function __construct()
    {
        $this->dbHandle = Database::getInstance()->getDatabaseConnection();
    }

    public function addData($timeRequired, $textTyped, $suggestionsOn, $maxNumberSuggestions, $queryPerformedBy, $REMOTE_ADDR)
    {
        $query = "INSERT INTO sgb967_data_collector.search_data VALUES (NULL,'$timeRequired','$textTyped','$suggestionsOn','$maxNumberSuggestions','$queryPerformedBy','$REMOTE_ADDR')";
        $result = $this->dbHandle->prepare($query);;
        $result->execute();
    }

}