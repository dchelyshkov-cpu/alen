<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');

const RECIPIENT = 'cheldima@mail.ru';
const MAX_FILE_BYTES = 10485760; // 10 MiB

function respond(int $status, bool $ok, string $message): void {
    http_response_code($status);
    echo json_encode(['ok' => $ok, 'message' => $message], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    respond(405, false, 'Метод запроса не поддерживается.');
}

if (!empty($_POST['website'])) {
    respond(200, true, '');
}

$formType = (string)($_POST['formType'] ?? '');
$name = trim((string)($_POST['name'] ?? ''));
$phone = trim((string)($_POST['phone'] ?? ''));
$consent = isset($_POST['consent']);

if (!in_array($formType, ['callback', 'estimate'], true)) {
    respond(400, false, 'Неизвестный тип заявки.');
}
if ($name === '' || (function_exists('mb_strlen') ? mb_strlen($name) : strlen($name)) > 120) {
    respond(422, false, 'Проверьте поле «Имя».');
}
if ($phone === '' || (function_exists('mb_strlen') ? mb_strlen($phone) : strlen($phone)) > 60) {
    respond(422, false, 'Проверьте поле «Телефон».');
}
if (!$consent) {
    respond(422, false, 'Необходимо подтвердить согласие на обработку персональных данных.');
}

$attachment = null;
if ($formType === 'estimate') {
    if (!isset($_FILES['file']) || !is_array($_FILES['file'])) {
        respond(422, false, 'Прикрепите файл сметы.');
    }

    $file = $_FILES['file'];
    $error = (int)($file['error'] ?? UPLOAD_ERR_NO_FILE);
    if ($error !== UPLOAD_ERR_OK) {
        $message = match ($error) {
            UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => 'Файл слишком большой. Максимальный размер — 10 МБ.',
            UPLOAD_ERR_PARTIAL => 'Файл загрузился не полностью. Попробуйте ещё раз.',
            default => 'Не удалось загрузить файл. Попробуйте ещё раз.',
        };
        respond(422, false, $message);
    }

    $size = (int)($file['size'] ?? 0);
    $originalName = trim((string)($file['name'] ?? ''));
    $tmpName = (string)($file['tmp_name'] ?? '');
    if ($size <= 0 || $size > MAX_FILE_BYTES || $tmpName === '' || !is_uploaded_file($tmpName)) {
        respond(422, false, 'Файл слишком большой или повреждён. Максимальный размер — 10 МБ.');
    }

    $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
    $allowed = [
        'pdf'  => ['application/pdf'],
        'doc'  => ['application/msword'],
        'docx' => ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip'],
        'xls'  => ['application/vnd.ms-excel'],
        'xlsx' => ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/zip'],
        'jpg'  => ['image/jpeg'],
        'jpeg' => ['image/jpeg'],
        'png'  => ['image/png'],
    ];

    if (!isset($allowed[$extension])) {
        respond(422, false, 'Недопустимый формат файла. Используйте PDF, DOC/DOCX, XLS/XLSX, JPG/JPEG или PNG.');
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($tmpName) ?: 'application/octet-stream';
    if (!in_array($mime, $allowed[$extension], true)) {
        respond(422, false, 'Тип файла не соответствует его расширению. Выберите файл сметы ещё раз.');
    }

    $safeName = preg_replace('/[^A-Za-z0-9._-]+/', '_', $originalName) ?: ('estimate.' . $extension);
    $safeName = substr($safeName, 0, 160);
    $attachment = [
        'path' => $tmpName,
        'name' => $safeName,
        'mime' => $mime,
    ];
}

$host = preg_replace('/[^A-Za-z0-9.-]/', '', (string)($_SERVER['HTTP_HOST'] ?? 'localhost')) ?: 'localhost';
$from = 'forms@' . $host;

$subjectText = $formType === 'callback'
    ? 'Заказ звонка с сайта «Ремонт квартир под ключ»'
    : 'Проверка сметы с сайта «Ремонт квартир под ключ»';
$subject = '=?UTF-8?B?' . base64_encode($subjectText) . '?=';

$lines = [
    'Новая заявка с сайта «Ремонт квартир под ключ»',
    '',
    'Тип заявки: ' . ($formType === 'callback' ? 'Заказать звонок' : 'Проверить мою смету'),
    'Имя: ' . $name,
    'Телефон: ' . $phone,
];
if ($attachment !== null) {
    $lines[] = 'Файл: ' . $attachment['name'];
    $lines[] = 'Размер: ' . number_format($size / 1048576, 2, ',', ' ') . ' МБ';
}
$bodyText = implode("\r\n", $lines) . "\r\n";

$headers = [
    'MIME-Version: 1.0',
    'From: =?UTF-8?B?' . base64_encode('Ремонт квартир под ключ') . '?= <' . $from . '>',
    'Reply-To: ' . RECIPIENT,
];

if ($attachment === null) {
    $headers[] = 'Content-Type: text/plain; charset=UTF-8';
    $sent = mail(RECIPIENT, $subject, $bodyText, implode("\r\n", $headers));
} else {
    $boundary = '=_ALENINDAHOUSE_' . bin2hex(random_bytes(12));
    $headers[] = 'Content-Type: multipart/mixed; boundary="' . $boundary . '"';

    $encodedFile = chunk_split(base64_encode((string)file_get_contents($attachment['path'])));
    $encodedName = '=?UTF-8?B?' . base64_encode($attachment['name']) . '?=';
    $body = '--' . $boundary . "\r\n";
    $body .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
    $body .= $bodyText . "\r\n";
    $body .= '--' . $boundary . "\r\n";
    $body .= 'Content-Type: ' . $attachment['mime'] . '; name="' . $encodedName . "\"\r\n";
    $body .= 'Content-Disposition: attachment; filename="' . $encodedName . "\"\r\n";
    $body .= "Content-Transfer-Encoding: base64\r\n\r\n";
    $body .= $encodedFile . "\r\n";
    $body .= '--' . $boundary . "--\r\n";

    $sent = mail(RECIPIENT, $subject, $body, implode("\r\n", $headers));
}

if (!$sent) {
    respond(500, false, 'Сейчас не удалось отправить заявку. Попробуйте ещё раз немного позже.');
}

respond(200, true, 'Заявка успешно отправлена.');
