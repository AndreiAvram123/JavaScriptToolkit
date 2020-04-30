<?php
header("Access-Control-Allow-Origin: *");

require_once "CollectorRepository.php";

$collectorRepository = new CollectorRepository();
if (isset($_REQUEST['requestName']) && $_REQUEST['requestName'] == "addData") {

    $timeRequired = $_REQUEST['timeRequired'];
    $textTyped = $_REQUEST['textTyped'];
    $suggestionsOn = $_REQUEST['suggestionsOn'] === 'true';
    $maxNumberSuggestions = $_REQUEST['maxNumberSuggestions'];
    $queryPerformedBy = $_REQUEST['queryPerformedBy'];
    $collectorRepository->addData($timeRequired, $textTyped, $suggestionsOn, $maxNumberSuggestions, $queryPerformedBy, $_SERVER['REMOTE_ADDR']);
    echo "dff";
}

?>