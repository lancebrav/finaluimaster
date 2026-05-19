<?php
header('Content-Type: application/json');
require_once __DIR__ . '/email_config.php';

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || empty($input['email'])) {
    echo json_encode(['success' => false, 'message' => 'Missing email or payload']);
    exit;
}

$to = filter_var($input['email'], FILTER_VALIDATE_EMAIL);
$subject = $input['subject'] ?? 'Document Request Received';
$name = $input['name'] ?? '';
$docType = $input['docType'] ?? '';
$customBody = $input['customBody'] ?? null;
$action = $input['action'] ?? 'submitted';

if (!$to) {
    echo json_encode(['success' => false, 'message' => 'Invalid recipient email']);
    exit;
}

//try load phpmailer
$loaded = false;
if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    require_once __DIR__ . '/../vendor/autoload.php';
    $loaded = true;
} else if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require_once __DIR__ . '/vendor/autoload.php';
    $loaded = true;
} else {
    //phpmailer direct
    if (file_exists(__DIR__ . '/PHPMailer/src/PHPMailer.php')) {
        require_once __DIR__ . '/PHPMailer/src/Exception.php';
        require_once __DIR__ . '/PHPMailer/src/PHPMailer.php';
        require_once __DIR__ . '/PHPMailer/src/SMTP.php';
        $loaded = true;
    }
}

if (!$loaded) {
    echo json_encode(['success' => false, 'message' => 'PHPMailer not installed. Run: composer require phpmailer/phpmailer']);
    exit;
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

if ($customBody) {
    //custom mail
    $bodyHtml = "<p>" . nl2br(htmlspecialchars($customBody)) . "</p>";
} elseif ($action === 'approved') {
    //APPROVED
    $bodyHtml = "<p>Dear " . htmlspecialchars($name) . ",</p>" .
      "<p>Good news! Your request for <strong>" . htmlspecialchars($docType) . "</strong> has been <strong style='color: green;'>APPROVED</strong>.</p>" .
      "<p>Your document is now ready for pickup. Please visit the Barangay Office to collect your document.</p>" .
      "<p><strong>Reference:</strong> " . htmlspecialchars($input['requestId'] ?? 'N/A') . "</p>" .
      "<p>Thank you!</p>" .
      "<p>Regards,<br>Barangay 663</p>";
} elseif ($action === 'rejected') {
    //REJECTED
    $bodyHtml = "<p>Dear " . htmlspecialchars($name) . ",</p>" .
      "<p>We regret to inform you that your request for <strong>" . htmlspecialchars($docType) . "</strong> has been <strong style='color: red;'>REJECTED</strong>.</p>" .
      "<p>Please contact the Barangay Office for more information or to resubmit your request.</p>" .
      "<p><strong>Reference:</strong> " . htmlspecialchars($input['requestId'] ?? 'N/A') . "</p>" .
      "<p>Regards,<br>Barangay 663</p>";
} else {
    //SUBMISSION 
    $bodyHtml = "<p>Dear " . htmlspecialchars($name) . ",</p>" .
      "<p>Your request for <strong>" . htmlspecialchars($docType) . "</strong> has been received successfully.</p>" .
      "<p>Please wait for approval. We will notify you once your document is ready for pickup.</p>" .
      "<p><strong>Reference:</strong> " . htmlspecialchars($input['requestId'] ?? 'N/A') . "</p>" .
      "<p>Regards,<br>Barangay 663</p>";
}

try {
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = SMTP_HOST;
    $mail->SMTPAuth = true;
    $mail->Username = SMTP_USER;
    $mail->Password = SMTP_PASS;
    $mail->SMTPSecure = EMAIL_SECURE === 'ssl' ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = SMTP_PORT;

    $mail->setFrom(SMTP_FROM, SMTP_FROM_NAME);
    $mail->addAddress($to);
    $mail->Subject = $subject;
    $mail->isHTML(true);
    $mail->Body = $bodyHtml;
    $mail->AltBody = strip_tags($bodyHtml);

    $mail->send();
    echo json_encode(['success' => true, 'message' => 'Email sent']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Mailer Error: ' . $e->getMessage()]);
}

?>
