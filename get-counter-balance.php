<?php
//Set required headers
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');


// Get JSON data from file
$json = file_get_contents('counter-balance.json');

//Output, response
echo $json;



?>