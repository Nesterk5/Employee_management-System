// Global Variables
let currentEmployeeId = null;
let currentPage = 1;
const itemsPerPage = 10;

// Page Initialization
document.addEventListener("DOMContentLoaded", () => {
  loadEmployees();
  setupSearchAndPagination();
  setupEndDateField();
});

// Form submission listener
document
  .getElementById("employeeForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    if (validateForm()) {
      saveEmployee();
    }
  });

// Setup Functions
function setupEndDateField() {
  const endDateField = document.getElementById("employeeEndDate");
  endDateField.setAttribute("disabled", "disabled");

  document
    .getElementById("employeeEmploymentType")
    .addEventListener("change", function () {
      if (this.value === "Contract") {
        endDateField.removeAttribute("disabled");
        endDateField.setAttribute("required", "required");
      } else {
        endDateField.setAttribute("disabled", "disabled");
        endDateField.removeAttribute("required");
        endDateField.value = "";
      }
    });
}

function setupSearchAndPagination() {
  const searchContainer = document.getElementById("searchContainer");
  searchContainer.innerHTML = `
        <div class="input-group mb-3">
            <input type="text" class="form-control" id="searchInput" 
                   placeholder="Search by name, email, job title, department...">
            <button class="btn btn-outline-secondary" type="button" id="searchButton">
                <i class="fas fa-search"></i> Search
            </button>
        </div>
    `;

  let searchTimeout;
  document.getElementById("searchInput").addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      loadEmployees(1, e.target.value);
    }, 500);
  });
}

// function for loading employees
function loadEmployees(page = 1, search = "") {
  currentPage = page;
  const url = `api.php?page=${page}&limit=${itemsPerPage}&search=${encodeURIComponent(
    search
  )}`;

  showLoadingSpinner();

  fetch(url)
    .then(async (response) => {
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "login.php";
          throw new Error("Session expired. Please log in again.");
        }
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to load employees");
      }
      return response.json();
    })
    .then((data) => {
      if (data.status === "success") {
        displayEmployees(data.data);
        updatePagination(data.pagination);
      } else {
        throw new Error(data.message || "Failed to load employees");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      showAlert(error.message, "error");
    })
    .finally(() => {
      hideLoadingSpinner();
    });
}

// Display Functions
function displayEmployees(employees) {
  const tableBody = document.getElementById("employeeTableBody");
  tableBody.innerHTML = "";

  if (!employees || employees.length === 0) {
    tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">No employees found</td>
            </tr>
        `;
    return;
  }

  employees.forEach((employee) => {
    const row = document.createElement("tr");
    row.className = "employee-row";

    row.innerHTML = `
            <td>${employee.employee_id || ""}</td>
            <td>${employee.employee_name || ""}</td>
            <td>${employee.email || ""}</td>
            <td>${employee.phone_number || ""}</td>
            <td>${employee.job_title || ""}</td>
            <td>${employee.department || ""}</td>
            <td>
                <button class="btn btn-sm btn-info view-button" onclick="viewEmployee(${
                  employee.id
                })">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="btn btn-sm btn-primary me-1" onclick="editEmployee(${
                  employee.id
                })">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteEmployee(${
                  employee.id
                })">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;

    tableBody.appendChild(row);
  });
}

function updatePagination(pagination) {
  const paginationContainer = document.getElementById("pagination");
  const totalPages = pagination.total_pages;
  currentPage = pagination.page;

  let paginationHTML = `
        <nav aria-label="Page navigation">
            <ul class="pagination justify-content-center">
                <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
                    <a class="page-link" href="#" onclick="loadEmployees(${
                      currentPage - 1
                    })">Previous</a>
                </li>
    `;

  for (let i = 1; i <= totalPages; i++) {
    paginationHTML += `
            <li class="page-item ${currentPage === i ? "active" : ""}">
                <a class="page-link" href="#" onclick="loadEmployees(${i})">${i}</a>
            </li>
        `;
  }

  paginationHTML += `
                <li class="page-item ${
                  currentPage === totalPages ? "disabled" : ""
                }">
                    <a class="page-link" href="#" onclick="loadEmployees(${
                      currentPage + 1
                    })">Next</a>
                </li>
            </ul>
        </nav>
    `;

  paginationContainer.innerHTML = paginationHTML;
}

//function for viewing employee details
function viewEmployee(id) {
  showLoadingSpinner();

  fetch(`api.php?id=${id}`)
    .then((response) => response.json())
    .then((data) => {
      hideLoadingSpinner();
      if (data.status === "success" && data.data.length > 0) {
        const employee = data.data[0];
        Swal.fire({
          title: `<h5 class="mb-0">${employee.employee_name}'s Details</h5>`,
          html: generateEmployeeDetailsHTML(employee),
          width: "800px",
          showCloseButton: true,
          showConfirmButton: false,
          customClass: {
            container: "employee-details-modal",
            popup: "swal2-popup-custom",
            content: "px-4",
          },
        });
      } else {
        showAlert("Employee not found", "error");
      }
    })
    .catch((error) => {
      hideLoadingSpinner();
      console.error("Error:", error);
      showAlert("Error loading employee details", "error");
    });
}

function generateEmployeeDetailsHTML(employee) {
  return `
        <div class="container-fluid">
            <div class="row mt-3">
                <div class="col-md-6">
                    <p><strong>Employee ID:</strong> ${employee.employee_id}</p>
                    <p><strong>Name:</strong> ${employee.employee_name}</p>
                    <p><strong>Email:</strong> ${employee.email}</p>
                    <p><strong>Phone:</strong> ${employee.phone_number}</p>
                    <p><strong>Gender:</strong> ${employee.gender || "N/A"}</p>
                    <p><strong>Date of Birth:</strong> ${
                      employee.DOB || "N/A"
                    }</p>
                    <p><strong>National ID:</strong> ${
                      employee.national_id || "N/A"
                    }</p>
                    <p><strong>Marital Status:</strong> ${
                      employee.marital_status || "N/A"
                    }</p>
                </div>
                <div class="col-md-6">
                    <p><strong>Job Title:</strong> ${employee.job_title}</p>
                    <p><strong>Department:</strong> ${employee.department}</p>
                    <p><strong>Employment Type:</strong> ${
                      employee.employment_type || "N/A"
                    }</p>
                    <p><strong>Salary:</strong> ${employee.salary || "N/A"}</p>
                    <p><strong>Hire Date:</strong> ${
                      employee.hire_date || "N/A"
                    }</p>
                    <p><strong>End Date:</strong> ${
                      employee.end_date || "N/A"
                    }</p>
                    <p><strong>Office Location:</strong> ${
                      employee.office_location || "N/A"
                    }</p>
                    <p><strong>Pay Grade:</strong> ${
                      employee.pay_grade || "N/A"
                    }</p>
                    <p><strong>Bank Account:</strong> ${
                      employee.bank_account || "N/A"
                    }</p>
                </div>
            </div>
        </div>
    `;
}

// Function for saving new employee
function saveEmployee() {
  showLoadingSpinner();

  const employeeData = {
    employeeId: document.getElementById("employeeId").value.trim(),
    employeeName: document.getElementById("employeeName").value.trim(),
    employeeDOB: document.getElementById("employeeDOB").value,
    employeeGender: document.getElementById("employeeGender").value,
    employeeNationalId: document
      .getElementById("employeeNationalId")
      .value.trim(),
    employeePhone: document.getElementById("employeePhone").value.trim(),
    employeeEmail: document.getElementById("employeeEmail").value.trim(),
    employeeMaritalStatus: document.getElementById("employeeMaritalStatus")
      .value,
    employeeJobTitle: document.getElementById("employeeJobTitle").value.trim(),
    employeeDepartment: document.getElementById("employeeDepartment").value,
    employeeEmploymentType: document.getElementById("employeeEmploymentType")
      .value,
    employeeHireDate: document.getElementById("employeeHireDate").value,
    employeeEndDate: document.getElementById("employeeEndDate").value,
    employeeOfficeLocation: document
      .getElementById("employeeOfficeLocation")
      .value.trim(),
    employeeSalary: document.getElementById("employeeSalary").value,
    employeePayGrade: document.getElementById("employeePayGrade").value,
    employeeBankAccount: document
      .getElementById("employeeBankAccount")
      .value.trim(),
  };

  if (currentEmployeeId) {
    employeeData.id = currentEmployeeId;
  }

  fetch("api.php", {
    method: currentEmployeeId ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(employeeData),
  })
    .then(async (response) => {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to save employee");
      }
      return data;
    })
    .then((data) => {
      if (data.status === "success") {
        showAlert(data.message, "success");
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("employeeModal")
        );
        modal.hide();
        loadEmployees(currentPage);
        clearForm();
      } else {
        throw new Error(data.message || "Failed to save employee");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      showAlert(error.message, "error");
    })
    .finally(() => {
      hideLoadingSpinner();
    });
}

function editEmployee(id) {
  currentEmployeeId = id;
  showLoadingSpinner();

  fetch(`api.php?id=${id}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success" && data.data.length > 0) {
        const employee = data.data[0];
        fillForm(employee);
        document.getElementById("employeeModalLabel").textContent =
          "Edit Employee";
        const modal = new bootstrap.Modal(
          document.getElementById("employeeModal")
        );
        modal.show();
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      showAlert("Error loading employee details", "error");
    })
    .finally(() => {
      hideLoadingSpinner();
    });
}

//function for deleting an employee
function deleteEmployee(id) {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      showLoadingSpinner();
      fetch(`api.php?id=${id}`, {
        method: "DELETE",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "success") {
            showAlert("Employee deleted successfully", "success");
            loadEmployees(currentPage);
          } else {
            throw new Error(data.message || "Error deleting employee");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          showAlert(error.message, "error");
        })
        .finally(() => {
          hideLoadingSpinner();
        });
    }
  });
}

// Form validations

function fillForm(employee) {
  document.getElementById("employeeId").value = employee.employee_id || "";
  document.getElementById("employeeName").value = employee.employee_name || "";
  document.getElementById("employeeDOB").value = employee.DOB || "";
  document.getElementById("employeeGender").value = employee.gender || "";
  document.getElementById("employeeNationalId").value =
    employee.national_id || "";
  document.getElementById("employeePhone").value = employee.phone_number || "";
  document.getElementById("employeeEmail").value = employee.email || "";
  document.getElementById("employeeMaritalStatus").value =
    employee.marital_status || "";
  document.getElementById("employeeJobTitle").value = employee.job_title || "";
  document.getElementById("employeeDepartment").value =
    employee.department || "";
  document.getElementById("employeeEmploymentType").value =
    employee.employment_type || "";
  document.getElementById("employeeHireDate").value = employee.hire_date || "";
  document.getElementById("employeeEndDate").value = employee.end_date || "";
  document.getElementById("employeeOfficeLocation").value =
    employee.office_location || "";
  document.getElementById("employeeSalary").value = employee.salary || "";
  document.getElementById("employeePayGrade").value = employee.pay_grade || "";
  document.getElementById("employeeBankAccount").value =
    employee.bank_account || "";

  // Handle employment type and end date
  const endDateField = document.getElementById("employeeEndDate");
  if (employee.employment_type === "Contract") {
    endDateField.removeAttribute("disabled");
    endDateField.setAttribute("required", "required");
  } else {
    endDateField.setAttribute("disabled", "disabled");
    endDateField.removeAttribute("required");
  }
}

function clearForm() {
  currentEmployeeId = null;
  document.getElementById("employeeForm").reset();
  document.getElementById("employeeModalLabel").textContent = "Add Employee";
  clearErrors();

  // Reset end date field
  const endDateField = document.getElementById("employeeEndDate");
  endDateField.setAttribute("disabled", "disabled");
  endDateField.removeAttribute("required");
}

// Validation Functions
function validateForm() {
  const requiredFields = [
    "employeeId",
    "employeeName",
    "employeeEmail",
    "employeePhone",
    "employeeJobTitle",
    "employeeHireDate",
    "employeeSalary",
  ];
  clearErrors();

  let isValid = true;
  let firstError = null;

  requiredFields.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    if (!field.value.trim()) {
      showError(fieldId, "This field is required");
      isValid = false;
      if (!firstError) firstError = field;
    }
  });

  const emailField = document.getElementById("employeeEmail");
  if (emailField.value && !isValidEmail(emailField.value)) {
    showError("employeeEmail", "Please enter a valid email address");
    isValid = false;
    if (!firstError) firstError = emailField;
  }

  const phoneField = document.getElementById("employeePhone");
  if (phoneField.value && !isValidPhone(phoneField.value)) {
    showError("employeePhone", "Please enter a valid phone number");
    isValid = false;
    if (!firstError) firstError = phoneField;
  }

  if (firstError) {
    firstError.focus();
  }

  return isValid;
}

function showError(fieldId, message) {
  const field = document.getElementById(fieldId);
  field.classList.add("is-invalid");

  const errorDiv = document.createElement("div");
  errorDiv.className = "invalid-feedback";
  errorDiv.textContent = message;
  field.parentNode.appendChild(errorDiv);
}

function clearErrors() {
  document.querySelectorAll(".is-invalid").forEach((field) => {
    field.classList.remove("is-invalid");
    const errorDiv = field.parentNode.querySelector(".invalid-feedback");
    if (errorDiv) {
      errorDiv.remove();
    }
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^\+?[\d\s-]{10,}$/.test(phone);
}

function showAlert(message, icon) {
  Swal.fire({
    title: message,
    icon: icon,
    timer: 2000,
    showConfirmButton: false,
  });
}

function showLoadingSpinner() {
  Swal.fire({
    title: "Loading...",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
}

function hideLoadingSpinner() {
  Swal.close();
}
