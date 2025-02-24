<?php require_once 'check_session.php'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Employee Management System</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/sweetalert2@11.7.32/dist/sweetalert2.min.css" rel="stylesheet">
    <style>
        .table th, .table td {
            vertical-align: middle;
        }
        .user-info {
            background: #f8f9fa;
            padding: 10px 15px;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container mt-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Employee Management System</h2>
            <div class="user-info">
                <span class="me-3">Welcome, <?php echo htmlspecialchars($_SESSION['username']); ?></span>
                <a href="logout.php" class="btn btn-danger btn-sm">Logout</a>
            </div>
        </div>

        <!-- Button to trigger Add Employee Modal -->
        <button class="btn btn-primary mb-3" data-bs-toggle="modal" data-bs-target="#employeeModal" onclick="clearForm()">
            Add Employee
        </button>

        <!-- Search Container will be inserted here by JavaScript -->
        <div id="searchContainer"></div>

        <!-- Table to display employee data -->
        <div class="table-responsive mt-4">
            <table class="table table-bordered table-hover">
                <thead class="table-light">
                    <tr>
                        <th>Employee ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Job Title</th>
                        <th>Department</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="employeeTableBody">
                    <!-- Employee rows will be inserted here dynamically -->
                </tbody>
            </table>
        </div>

        <!-- Pagination Container -->
        <div id="pagination" class="mt-3"></div>

        <!-- Add/Edit Employee Modal -->
        <div class="modal fade" id="employeeModal" tabindex="-1" aria-labelledby="employeeModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="employeeModalLabel">Add Employee</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="employeeForm">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="employeeId" class="form-label">Employee ID</label>
                                    <input type="text" class="form-control" id="employeeId" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="employeeName" class="form-label">Full Name</label>
                                    <input type="text" class="form-control" id="employeeName" required>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="employeeDOB" class="form-label">Date of Birth</label>
                                    <input type="date" class="form-control" id="employeeDOB">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="employeeGender" class="form-label">Gender</label>
                                    <select class="form-control" id="employeeGender">
                                        <option value="" disabled selected>Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="employeeNationalId" class="form-label">National ID</label>
                                    <input type="text" class="form-control" id="employeeNationalId">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="employeePhone" class="form-label">Phone Number</label>
                                    <input type="text" class="form-control" id="employeePhone" required>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="employeeEmail" class="form-label">Email</label>
                                    <input type="email" class="form-control" id="employeeEmail" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="employeeMaritalStatus" class="form-label">Marital Status</label>
                                    <select class="form-control" id="employeeMaritalStatus">
                                        <option value="" disabled selected>Select Marital Status</option>
                                        <option value="Single">Single</option>
                                        <option value="Married">Married</option>
                                        <option value="Divorced">Divorced</option>
                                        <option value="Widowed">Widowed</option>
                                    </select>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="employeeJobTitle" class="form-label">Job Title</label>
                                    <input type="text" class="form-control" id="employeeJobTitle" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="employeeDepartment" class="form-label">Department</label>
                                    <input type="text" class="form-control" id="employeeDepartment">
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="employeeEmploymentType" class="form-label">Employment Type</label>
                                    <select class="form-control" id="employeeEmploymentType">
                                        <option value="" disabled selected>Select Employment Type</option>
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Contract">Contract</option>
                                    </select>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="employeeHireDate" class="form-label">Hire Date</label>
                                    <input type="date" class="form-control" id="employeeHireDate" required>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="employeeEndDate" class="form-label">End Date</label>
                                    <input type="date" class="form-control" id="employeeEndDate">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="employeeOfficeLocation" class="form-label">Office Location</label>
                                    <input type="text" class="form-control" id="employeeOfficeLocation">
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="employeeSalary" class="form-label">Salary</label>
                                    <input type="number" step="0.01" class="form-control" id="employeeSalary">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="employeePayGrade" class="form-label">Pay Grade</label>
                                    <select class="form-control" id="employeePayGrade">
                                        <option value="" disabled selected>Select Pay Grade</option>
                                        <option value="Grade 1">Grade 1</option>
                                        <option value="Grade 2">Grade 2</option>
                                        <option value="Grade 3">Grade 3</option>
                                        <option value="Grade 4">Grade 4</option>
                                        <option value="Grade 5">Grade 5</option>
                                    </select>
                                </div>
                            </div>

                            <div class="mb-3">
                                <label for="employeeBankAccount" class="form-label">Bank Account</label>
                                <input type="text" class="form-control" id="employeeBankAccount">
                            </div>

                            <div class="text-end">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                <button type="submit" class="btn btn-primary">Save Employee</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11.7.32/dist/sweetalert2.all.min.js"></script>
    <script src="script.js"></script>
</body>
</html>