<?php
session_start();
error_reporting(0);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'db_config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
        'status' => 'error',
        'message' => 'Your session has expired. Please log in again.'
    ]);
    exit;
}

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $page = isset($_GET['page']) ? (int) $_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 10;
    $offset = ($page - 1) * $limit;
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';

    switch ($method) {
        case 'GET':
            // Single employee fetch
            if (isset($_GET['id'])) {
                $stmt = $pdo->prepare("SELECT * FROM employees WHERE id = ?");
                $stmt->execute([$_GET['id']]);
                $employee = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($employee) {
                    echo json_encode(['status' => 'success', 'data' => [$employee]]);
                } else {
                    http_response_code(404);
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Employee not found'
                    ]);
                }
                exit;
            }

            // List employees with search
            $whereClause = '';
            $params = [];
            if ($search) {
                $whereClause = "WHERE 
                    employee_id LIKE ? OR
                    employee_name LIKE ? OR 
                    email LIKE ? OR 
                    phone_number LIKE ? OR
                    job_title LIKE ? OR 
                    department LIKE ? OR
                    employment_type LIKE ? OR
                    office_location LIKE ?";
                $searchTerm = "%$search%";
                $params = array_fill(0, 8, $searchTerm);
            }

            // Count total records
            $countSql = "SELECT COUNT(*) FROM employees " . $whereClause;
            $countStmt = $pdo->prepare($countSql);
            if ($search) {
                $countStmt->execute($params);
            } else {
                $countStmt->execute();
            }
            $totalRecords = $countStmt->fetchColumn();
            $totalPages = ceil($totalRecords / $limit);

            // Fetch records
            $sql = "SELECT * FROM employees $whereClause ORDER BY id DESC LIMIT ? OFFSET ?";
            $stmt = $pdo->prepare($sql);

            if ($search) {
                array_push($params, $limit, $offset);
                $stmt->execute($params);
            } else {
                $stmt->execute([$limit, $offset]);
            }

            $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);

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
            break;

        case 'POST':
            $data = json_decode(file_get_contents("php://input"), true);

            // Validate required fields
            $required_fields = ['employeeId', 'employeeName', 'employeeEmail', 'employeePhone', 'employeeJobTitle'];
            foreach ($required_fields as $field) {
                if (empty($data[$field])) {
                    http_response_code(400);
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Please fill in all required fields: ' . str_replace('employee', '', $field)
                    ]);
                    exit;
                }
            }

            // Validate email format
            if (!filter_var($data['employeeEmail'], FILTER_VALIDATE_EMAIL)) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Invalid email format'
                ]);
                exit;
            }

            // Check for duplicates
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM employees WHERE email = ? OR employee_id = ?");
            $stmt->execute([$data['employeeEmail'], $data['employeeId']]);
            if ($stmt->fetchColumn() > 0) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'An employee with this email or ID already exists'
                ]);
                exit;
            }

            // Insert employee
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

            echo json_encode([
                'status' => 'success',
                'message' => 'Employee added successfully'
            ]);
            break;

        case 'PUT':
            $data = json_decode(file_get_contents("php://input"), true);

            if (!isset($data['id'])) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Employee ID is required']);
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

            echo json_encode([
                'status' => 'success',
                'message' => 'Employee updated successfully'
            ]);
            break;

        case 'DELETE':
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
            break;
    }
} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'A database error occurred. Please try again later.'
    ]);
} catch (Exception $e) {
    error_log("General error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'An unexpected error occurred. Please try again later.'
    ]);
}
?>