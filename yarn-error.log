<?php
// Get the Bearer token from the request header
$token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

// Validate the Bearer token
// $validToken = 'your_bearer_token'; // Replace with your actual bearer token

// if ($token !== 'Bearer ' . $validToken) {
//     // Invalid token, send error response
//     $response['status'] = 'error';
//     $response['data'] = null;
//     $response['message'] = 'Invalid authentication token';

//     http_response_code(401);
//     echo json_encode($response);
//     exit();
// }

// Check if the required POST parameters are provided
if (!isset($_POST['to']) || !isset($_POST['subject']) || !isset($_POST['message'])) {
    // Missing parameters, send error response
    $response['status'] = 'error';
    $response['data'] = null;
    $response['message'] = 'Missing required parameters';

    http_response_code(400);
    echo json_encode($response);
    exit();
}

// Set the recipient email address
$to = $_POST['to'];

// Set the email subject
$subject = $_POST['subject'];

// Set the email message
$message = $_POST['message'];

// Set additional headers
$headers = 'From: yourname@example.com' . "\r\n" .
    'Reply-To: yourname@example.com' . "\r\n" .
    'X-Mailer: PHP/' . phpversion();

// Send the email
$mail_sent = mail($to, $subject, $message, $headers);

// Prepare the API response
$response = array();

if ($mail_sent) {
    $response['status'] = 'success';
    $response['data'] = null;
    $response['message'] = 'Email sent successfully.';
} else {
    $response['status'] = 'error';
    $response['data'] = null;
    $response['message'] = 'An error occurred while sending the email.';
}

// Convert the response to JSON
$json_response = json_encode($response);

// Set the appropriate content type header
header('Content-Type: application/json');

// Send the JSON response
echo $json_response;
?>
