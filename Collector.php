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
}
if (isset($_REQUEST['requestName']) && $_REQUEST['requestName'] === "AddAreaData") {
    $topL = $_REQUEST['topL'];
    $topC = $_REQUEST['topC'];
    $topR = $_REQUEST['topR'];
    $bottomL = $_REQUEST['bottomL'];
    $bottomC = $_REQUEST['bottomC'];
    $bottomR = $_REQUEST['bottomR'];
    $ip = $_SERVER['REMOTE_ADDR'];
    $collectorRepository->addAreaData($topL, $topC, $topR, $bottomL, $bottomC, $bottomR, $ip);

    $base = $_REQUEST['imageData'];
    $binary = base64_decode($base);
    $underscore_ip = str_replace(',', '_', $ip);
    header('Content-Type: image/jpeg; charset=utf-8');
    $imageLocation = "images/" . $underscore_ip . '_' . time() . ".jpeg";
    $file = fopen($imageLocation, 'wb');
    fwrite($file, $binary);
    fclose($file);


}


?>