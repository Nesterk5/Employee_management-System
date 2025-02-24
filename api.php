<?php
session_start();
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Set proper headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'db_config.php';

// Debug logging
error_log("API Request Method: " . $_SERVER['REQUEST_METHOD']);
error_log("Raw input: " . file_get_contents("php://input"));

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

// Get page number and limit for pagination
$page = isset($_GET['page']) ? (int) $_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 10;
$offset = ($page - 1) * $limit;

// Get search term if provided
$search = isset($_GET['search']) ? $_GET['search'] : '';

switch ($method) {
    case 'GET':
        try {
            // If ID is provided, fetch single employee
            if (isset($_GET['id'])) {
                $stmt = $pdo->prepare("SELECT * FROM employees WHERE id = ?");
                $stmt->execute([$_GET['id']]);
                $employee = $stmt->fetch();

                if ($employee) {
                    echo json_encode(['status' => 'success', 'data' => [$employee]]);
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Employee not found']);
                }
                exit;
            }

            // Count total records for pagination
            if ($search) {
                $countStmt = $pdo->prepare("SELECT COUNT(*) FROM employees WHERE 
                    employee_name LIKE ? OR 
                    email LIKE ? OR 
                    job_title LIKE ? OR 
                    department LIKE ?");
                $searchTerm = "%$search%";
                $countStmt->execute([$searchTerm, $searchTerm, $searchTerm, $searchTerm]);
            } else {
                $countStmt = $pdo->query("SELECT COUNT(*) FROM employees");
            }
            $totalRecords = $countStmt->fetchColumn();
            $totalPages = ceil($totalRecords / $limit);

            // Fetch employees with pagination and search
            if ($search) {
                $sql = "SELECT * FROM employees WHERE 
                    employee_name LIKE :search OR 
                    email LIKE :search OR 
                    job_title LIKE :search OR 
                    department LIKE :search 
                    ORDER BY id DESC LIMIT :limit OFFSET :offset";
                $stmt = $pdo->prepare($sql);
                $stmt->bindValue(':search', "%$search%", PDO::PARAM_STR);
                $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
                $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
                $stmt->execute();
            } else {
                $sql = "SELECT * FROM employees ORDER BY id DESC LIMIT :limit OFFSET :offset";
                $stmt = $pdo->prepare($sql);
                $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
                $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
                $stmt->execute();
            }

            $employees = $stmt->fetchAll();

            echo json_encode([
                'status' => 'success',
                'data' => $employees,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $totalRecords,
                    'total_pages' => $totalPages
                ]
            ]);
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
        }
        break;

    case 'POST':
        try {
            $data = json_decode(file_get_contents("php://input"), true);

            // Validate required fields
            $required_fields = ['employeeId', 'employeeName', 'employeeEmail', 'employeePhone', 'employeeJobTitle'];
            foreach ($required_fields as $field) {
                if (empty($data[$field])) {
                    http_response_code(400);
                    echo json_encode(['status' => 'error', 'message' => ucfirst($field) . ' is required']);
                    exit;
                }
            }

            // Validate email format
            if (!filter_var($data['employeeEmail'], FILTER_VALIDATE_EMAIL)) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Invalid email format']);
                exit;
            }

            // Check if email or employee ID already exists
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM employees WHERE email = ? OR employee_id = ?");
            $stmt->execute([$data['employeeEmail'], $data['employeeId']]);
            if ($stmt->fetchColumn() > 0) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Email or Employee ID already exists']);
                exit;
            }

            $sql = "INSERT INTO employees (
                employee_id, employee_name, DOB, gender, national_id, 
                phone_number, email, marital_status, job_title, department, 
                employment_type, hire_date, end_date, office_location, 
                salary, pay_grade, bank_account
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $data['employeeId'],
                $data['employeeName'],
                $data['employeeDOB'] ?: null,
                $data['employeeGender'] ?: null,
                $data['employeeNationalId'] ?: null,
                $data['employeePhone'],
                $data['employeeEmail'],
                $data['employeeMaritalStatus'] ?: null,
                $data['employeeJobTitle'],
                $data['employeeDepartment'] ?: null,
                $data['employeeEmploymentType'] ?: null,
                $data['employeeHireDate'],
                $data['employeeEndDate'] ?: null,
                $data['employeeOfficeLocation'] ?: null,
                $data['employeeSalary'] ?: null,
                $data['employeePayGrade'] ?: null,
                $data['employeeBankAccount'] ?: null
            ]);

            echo json_encode(['status' => 'success', 'message' => 'Employee added successfully']);
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
        }
        break;

    case 'PUT':
        try {
            $data = json_decode(file_get_contents("php://input"), true);

            if (!isset($data['id'])) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Employee ID is required']);
                exit;
            }

            // Validate email format
            if (!filter_var($data['employeeEmail'], FILTER_VALIDATE_EMAIL)) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Invalid email format']);
                exit;
            }

            // Check if email exists for other employees
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM employees WHERE (email = ? OR employee_id = ?) AND id != ?");
            $stmt->execute([$data['employeeEmail'], $data['employeeId'], $data['id']]);
            if ($stmt->fetchColumn() > 0) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Email or Employee ID already exists']);
                exit;
            }

            $sql = "UPDATE employees SET 
                employee_id = ?, employee_name = ?, DOB = ?, gender = ?,
                national_id = ?, phone_number = ?, email = ?, marital_status = ?,
                job_title = ?, department = ?, employment_type = ?, hire_date = ?,
                end_date = ?, office_location = ?, salary = ?, pay_grade = ?,
                bank_account = ? WHERE id = ?";

            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $data['employeeId'],
                $data['employeeName'],
                $data['employeeDOB'] ?: null,
                $data['employeeGender'] ?: null,
                $data['employeeNationalId'] ?: null,
                $data['employeePhone'],
                $data['employeeEmail'],
                $data['employeeMaritalStatus'] ?: null,
                $data['employeeJobTitle'],
                $data['employeeDepartment'] ?: null,
                $data['employeeEmploymentType'] ?: null,
                $data['employeeHireDate'],
                $data['employeeEndDate'] ?: null,
                $data['employeeOfficeLocation'] ?: null,
                $data['employeeSalary'] ?: null,
                $data['employeePayGrade'] ?: null,
                $data['employeeBankAccount'] ?: null,
                $data['id']
            ]);

            echo json_encode(['status' => 'success', 'message' => 'Employee updated successfully']);
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        try {
            if (!isset($_GET['id'])) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Employee ID is required']);
                exit;
            }

            $stmt = $pdo->prepare("DELETE FROM employees WHERE id = ?");
            $stmt->execute([$_GET['id']]);

            if ($stmt->rowCount() > 0) {
                echo json_encode(['status' => 'success', 'message' => 'Employee deleted successfully']);
            } else {
                http_response_code(404);
                echo json_encode(['status' => 'error', 'message' => 'Employee not found']);
            }
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
        }
        break;
}
?>