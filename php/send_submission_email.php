<?php
header('Content-Type: application/json');
ini_set('display_errors', '0');
error_reporting(E_ALL);

require_once __DIR__ . '/email_config.php';

function email_json_response(bool $success, string $message, array $extra = []): void
{
    echo json_encode(array_merge(['success' => $success, 'message' => $message], $extra));
    exit;
}

function load_phpmailer(): bool
{
    if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
        require_once __DIR__ . '/../vendor/autoload.php';
        return true;
    }
    if (file_exists(__DIR__ . '/vendor/autoload.php')) {
        require_once __DIR__ . '/vendor/autoload.php';
        return true;
    }
    if (file_exists(__DIR__ . '/PHPMailer/src/PHPMailer.php')) {
        require_once __DIR__ . '/PHPMailer/src/Exception.php';
        require_once __DIR__ . '/PHPMailer/src/PHPMailer.php';
        require_once __DIR__ . '/PHPMailer/src/SMTP.php';
        return true;
    }
    return false;
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

try {

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || empty($input['email'])) {
    email_json_response(false, 'Missing email or payload');
}

$to = filter_var($input['email'], FILTER_VALIDATE_EMAIL);
$subject = $input['subject'] ?? 'Document Request Received';
$name = $input['name'] ?? '';
$docType = $input['docType'] ?? '';
$customBody = $input['customBody'] ?? null;
$action = $input['action'] ?? 'submitted';
$requestId = isset($input['requestId']) ? (int) $input['requestId'] : 0;

if (!$to) {
    email_json_response(false, 'Invalid recipient email');
}

function build_submission_reference(int $requestId): array
{
    $year = date('Y');
    $date = date('Y-m-d');
    $datetime = date('Y-m-d H:i:s');
    $sequence = max(1, $requestId);
    $paddedNumber = str_pad((string) $sequence, 6, '0', STR_PAD_LEFT);
    $referenceCode = $year . '-' . $date . '-' . $paddedNumber;

    return [
        'reference_code' => $referenceCode,
        'year' => $year,
        'date' => $date,
        'datetime' => $datetime,
        'sequence' => $sequence,
        'padded_number' => $paddedNumber,
    ];
}

function resolve_submission_meta(int $requestId): array
{
    return [
        'reference' => build_submission_reference($requestId),
    ];
}

$submissionMeta = null;
if ($action === 'submitted' || $action === 'custom' || $requestId > 0) {
    $submissionMeta = resolve_submission_meta($requestId);
}

if (!load_phpmailer()) {
    email_json_response(false, 'PHPMailer not installed. Run: composer require phpmailer/phpmailer');
}

$referenceBlock = '';
if ($submissionMeta) {
    $ref = $submissionMeta['reference'];
    $referenceBlock =
        '<p><strong>Reference No.:</strong> ' . htmlspecialchars($ref['reference_code']) . '</p>' .
        '<p style="margin:4px 0 0;font-size:14px;color:#444;">' .
        '<strong>Year:</strong> ' . htmlspecialchars($ref['year']) .
        ' &nbsp;|&nbsp; <strong>Date:</strong> ' . htmlspecialchars($ref['date']) .
        ' &nbsp;|&nbsp; <strong>Submission #:</strong> ' . htmlspecialchars($ref['padded_number']) .
        '</p>' .
        '<p style="margin:8px 0 0;font-size:14px;color:#444;">' .
        '<strong>Date &amp; time received:</strong> ' . htmlspecialchars($ref['datetime']) .
        '</p>';
}

if ($customBody) {
    $bodyHtml = '<p>Dear ' . htmlspecialchars($name) . ',</p>' .
        '<p>' . nl2br(htmlspecialchars($customBody)) . '</p>' .
        $referenceBlock .
        '<p>Regards,<br>Barangay 663</p>';
} elseif ($action === 'approved') {
    $bodyHtml = '<p>Dear ' . htmlspecialchars($name) . ',</p>' .
        '<p>Good news! Your request for <strong>' . htmlspecialchars($docType) . '</strong> has been <strong style="color: green;">APPROVED</strong>.</p>' .
        $referenceBlock .
        '<p>Your document is now ready for pickup. Please visit the Barangay Office to collect your document.</p>' .
        '<p>Thank you!</p>' .
        '<p>Regards,<br>Barangay 663</p>';
} elseif ($action === 'rejected') {
    $bodyHtml = '<p>Dear ' . htmlspecialchars($name) . ',</p>' .
        '<p>We regret to inform you that your request for <strong>' . htmlspecialchars($docType) . '</strong> has been <strong style="color: red;">REJECTED</strong>.</p>' .
        $referenceBlock .
        '<p>Please contact the Barangay Office for more information or to resubmit your request.</p>' .
        '<p>Regards,<br>Barangay 663</p>';
} else {
    $bodyHtml = '<p>Dear ' . htmlspecialchars($name) . ',</p>' .
        '<p>Your request for <strong>' . htmlspecialchars($docType) . '</strong> has been received successfully.</p>' .
        $referenceBlock .
        '<p>Please save your reference number for follow-up. We will notify you once your document is ready for pickup.</p>' .
        '<p>Regards,<br>Barangay 663</p>';
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

    $extra = [];
    if ($submissionMeta) {
        $extra['reference_code'] = $submissionMeta['reference']['reference_code'];
    }
    email_json_response(true, 'Email sent', $extra);
} catch (Exception $e) {
    email_json_response(false, 'Mailer Error: ' . $e->getMessage());
}
} catch (Throwable $e) {
    email_json_response(false, $e->getMessage());
}

?>
