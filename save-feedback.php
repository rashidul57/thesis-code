<?php
//Set required headers
header('Content-Type: application/json; charset=utf-8');


$cb_user_data = $_POST["cb_user_data"];
$answers = $_POST["answers"];
$email = $_POST["email"];

file_put_contents('counter-balance.json', $cb_user_data);
file_put_contents('answers/' . $email . '.json', $answers);


$resp = array("success"=> True);
echo json_encode($resp);



?>