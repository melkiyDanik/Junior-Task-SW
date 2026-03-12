<?php
// 1. Настройка CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 2. Включаем ошибки для диагностики
ini_set('display_errors', 1);
error_reporting(E_ALL);

// 3. Подключаем автозагрузку (выходим из public в корень)
$autoload = __DIR__ . '/../vendor/autoload.php';
if (!file_exists($autoload)) {
    die("Ошибка: Файл autoload.php не найден. Запустите 'composer install' в папке backend-source.");
}
require_once $autoload;

// 4. Запуск GraphQL
use App\Controller\GraphQL;

try {
    // Проверяем, загрузился ли класс, прежде чем вызывать его
    if (class_exists(GraphQL::class)) {
        // Вызываем СТАТИЧЕСКИЙ метод напрямую
        GraphQL::handle(); 
    } else {
        throw new Exception("Класс App\Controller\GraphQL не найден. Проверьте namespace в файле GraphQL.php");
    }
} catch (\Throwable $e) {
    header('Content-Type: application/json');
    echo json_encode(['errors' => [['message' => $e->getMessage()]]]);
}