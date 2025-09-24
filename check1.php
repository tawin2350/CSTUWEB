<?php
header('Content-Type: application/json; charset=utf-8');
$dataFile = 'data!@#$%^&*()!@#$%^&*(@#$%^&*(@#$%^&*$R%^&%^&*%^&*%^&^&*.json';
$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? '';
$code = $input['code'] ?? '';
$answer = $input['answer'] ?? '';

if (!file_exists($dataFile)) {
    echo json_encode(["success" => false, "message" => "ไม่พบไฟล์ข้อมูล"]);
    exit;
}

$data = json_decode(file_get_contents($dataFile), true);

if ($action === 'getHints') {
    if (isset($data[$code])) {
        $now = new DateTime('now', new DateTimeZone('Asia/Bangkok'));
        $hints = [];
        foreach ($data[$code]['hints'] as $hintObj) {
            $hintDate = new DateTime($hintObj['openDate'], new DateTimeZone('Asia/Bangkok'));
            if ($now >= $hintDate) {
                $hints[] = [
                    "hint" => $hintObj['hint'],
                    "status" => "open",
                    "daysLeft" => 0
                ];
            } else {
                $interval = $now->diff($hintDate);
                $daysLeft = (int)$interval->format('%r%a');
                $hints[] = [
                    "hint" => "(ยังไม่ถึงเวลาคำใบ้)",
                    "status" => "locked",
                    "daysLeft" => $daysLeft
                ];
            }
        }
        $ig = null;
        $igDaysLeft = null;
        if (isset($data[$code]['ig']['openDate']) && isset($data[$code]['ig']['value'])) {
            $igDate = new DateTime($data[$code]['ig']['openDate'], new DateTimeZone('Asia/Bangkok'));
            if ($now >= $igDate) {
                $ig = $data[$code]['ig']['value'];
                $igDaysLeft = 0;
            } else {
                $interval = $now->diff($igDate);
                $ig = null;
                $igDaysLeft = (int)$interval->format('%r%a');
            }
        }
        echo json_encode([
            "success" => true,
            "hints" => $hints,
            "ig" => $ig,
            "igDaysLeft" => $igDaysLeft,
            "studentId" => $data[$code]['studentId'] ?? '',
            "nickname" => $data[$code]['nickname'] ?? ''
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "ไม่พบรหัสน้องนี้"]);
    }
    exit;
}

if ($action === 'checkIG') {
    if (isset($data[$code])) {
        $now = new DateTime('now', new DateTimeZone('Asia/Bangkok'));
        if (isset($data[$code]['ig']['openDate']) && isset($data[$code]['ig']['value'])) {
            $igDate = new DateTime($data[$code]['ig']['openDate'], new DateTimeZone('Asia/Bangkok'));
            if ($now < $igDate) {
                echo json_encode(["success" => false, "message" => "ยังไม่ถึงเวลาที่จะดูเฉลย รอถึงวันที่ " . $igDate->format('Y-m-d') . " ก่อนนะ"]);
                exit;
            }
            if (strtolower($answer) === strtolower($data[$code]['ig']['value'])) {
                echo json_encode(["success" => true, "message" => "ถูกต้อง! เฉลย IG คือ " . $data[$code]['ig']['value']]);
            } else {
                echo json_encode(["success" => false, "message" => "ผิดจ้า ลองใหม่อีกที!"]);
            }
        }
    } else {
        echo json_encode(["success" => false, "message" => "ไม่พบรหัสน้องนี้"]);
    }
    exit;
}

echo json_encode(["success" => false, "message" => "Invalid action"]);
exit;
