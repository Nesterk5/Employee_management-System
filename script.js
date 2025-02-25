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

document
  .getElementById("employeeForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    console.log("Form submitted");
    const isValid = validateForm();
    console.log("Form validation result:", isValid);
    if (isValid) {
      console.log("Attempting to save employee");
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

// Function for loading employees
function loadEmployees(page = 1, search = "") {
  currentPage = page;
  const url = `api.php?page=${page}&limit=${itemsPerPage}&search=${encodeURIComponent(
    search
  )}`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        displayEmployees(data.data);
        updatePagination(data.pagination);
      } else {
        throw new Error(data.message || "Failed to load employees");
      }
    })
    .catch((error) => {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.message,
      });
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
  fetch(`api.php?id=${id}`)
    .then((response) => response.json())
    .then((data) => {
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
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "Employee not found",
        });
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Error loading employee details",
      });
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
  const employeeData = {
    employeeId: document.getElementById("employeeId").value.trim(),
    employeeName: document.getElementById("employeeName").value.trim(),
    employeeDOB: document.getElementById("employeeDOB").value || null,
    employeeGender: document.getElementById("employeeGender").value || null,
    employeeNationalId:
      document.getElementById("employeeNationalId").value.trim() || null,
    employeePhone: document.getElementById("employeePhone").value.trim(),
    employeeEmail: document.getElementById("employeeEmail").value.trim(),
    employeeMaritalStatus:
      document.getElementById("employeeMaritalStatus").value || null,
    employeeJobTitle: document.getElementById("employeeJobTitle").value.trim(),
    employeeDepartment:
      document.getElementById("employeeDepartment").value || null,
    employeeEmploymentType:
      document.getElementById("employeeEmploymentType").value || null,
    employeeHireDate: document.getElementById("employeeHireDate").value,
    employeeEndDate: document.getElementById("employeeEndDate").value || null,
    employeeOfficeLocation:
      document.getElementById("employeeOfficeLocation").value.trim() || null,
    employeeSalary: document.getElementById("employeeSalary").value || null,
    employeePayGrade: document.getElementById("employeePayGrade").value || null,
    employeeBankAccount:
      document.getElementById("employeeBankAccount").value.trim() || null,
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
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        // Hide modal
        const modalElement = document.getElementById("employeeModal");
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
          modalInstance.hide();
        }

        // Show success message
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: data.message,
          timer: 1500,
        });

        // Clear form and reload table
        clearForm();
        loadEmployees(currentPage);
      } else {
        throw new Error(data.message || "Failed to save employee");
      }
    })
    .catch((error) => {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.message,
      });
    });
}

//function for editing an employee
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
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`api.php?id=${id}`, {
        method: "DELETE",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "success") {
            Swal.fire({
              icon: "success",
              title: "Deleted!",
              text: "Employee has been deleted.",
              timer: 1500,
            });
            loadEmployees(currentPage);
          } else {
            throw new Error(data.message || "Error deleting employee");
          }
        })
        .catch((error) => {
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: error.message,
          });
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
  const form = document.getElementById("employeeForm");
  form.reset();

  // Reset end date field
  const endDateField = document.getElementById("employeeEndDate");
  endDateField.setAttribute("disabled", "disabled");
  endDateField.removeAttribute("required");
  endDateField.value = "";

  // Clear any validation errors
  clearErrors();

  // Reset modal title
  document.getElementById("employeeModalLabel").textContent = "Add Employee";
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

  // Check required fields
  requiredFields.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    if (!field.value.trim()) {
      showError(fieldId, "This field is required");
      isValid = false;
      if (!firstError) firstError = field;
    }
  });

  // Validate salary
  const salaryField = document.getElementById("employeeSalary");
  const salary = parseFloat(salaryField.value);
  if (isNaN(salary) || salary < 0) {
    showError("employeeSalary", "Salary must be a positive number");
    isValid = false;
    if (!firstError) firstError = salaryField;
  }

  // Validate email
  const emailField = document.getElementById("employeeEmail");
  if (emailField.value && !isValidEmail(emailField.value)) {
    showError("employeeEmail", "Please enter a valid email address");
    isValid = false;
    if (!firstError) firstError = emailField;
  }

  // Validate phone
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
  return new Promise((resolve) => {
    setTimeout(() => {
      Swal.fire({
        icon: icon,
        title: icon === "success" ? "Success!" : "Error!",
        text: message,
        timer: icon === "success" ? 2000 : undefined,
        showConfirmButton: icon !== "success",
        didClose: () => {
          resolve();
        },
      });
    }, 100);
  });
}

// function showLoadingSpinner() {
//   Swal.close();

//   setTimeout(() => {
//     Swal.fire({
//       title: "Loading...",
//       allowOutsideClick: false,
//       allowEscapeKey: false,
//       showConfirmButton: false,
//       didOpen: () => {
//         Swal.showLoading();
//       },
//     });
//   }, 100);
// }

// function hideLoadingSpinner() {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       if (Swal.isLoading()) {
//         Swal.close();
//       }
//       resolve();
//     }, 100);
//   });
// }
