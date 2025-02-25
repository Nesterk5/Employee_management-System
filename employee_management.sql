-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 25, 2025 at 08:02 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.0.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `employee_management`
--

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` int(11) NOT NULL,
  `employee_id` varchar(100) NOT NULL,
  `employee_name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone_number` varchar(100) NOT NULL,
  `national_id` varchar(100) NOT NULL,
  `address` varchar(100) NOT NULL,
  `DOB` date NOT NULL,
  `marital_status` enum('Single','Married','Divorced','Widowed') NOT NULL,
  `gender` enum('female','male','','') NOT NULL,
  `job_title` varchar(100) NOT NULL,
  `department` varchar(50) NOT NULL,
  `employment_type` enum('Full-time','Part-time','Contract','') NOT NULL,
  `hire_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `office_location` varchar(100) NOT NULL,
  `salary` decimal(10,0) NOT NULL,
  `pay_grade` enum('Grade 1','Grade 2','Grade 3','Grade 4','Grade 5') NOT NULL,
  `bank_account` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`id`, `employee_id`, `employee_name`, `email`, `phone_number`, `national_id`, `address`, `DOB`, `marital_status`, `gender`, `job_title`, `department`, `employment_type`, `hire_date`, `end_date`, `office_location`, `salary`, `pay_grade`, `bank_account`) VALUES
(1, 'emp001', 'Nester Kabatuku', 'nester@gmail.com', '0781033102', 'df3776tghhhbd', '', '2002-06-04', 'Married', 'female', 'developer', 'IT', 'Full-time', '2025-02-03', '0000-00-00', 'Kampala', 2, 'Grade 1', ''),
(3, 'emp002', 'Glane Arthur', 'glane@gmail.com', '0781056690', 'CDFG00987659', '', '2002-06-11', 'Single', 'male', 'IT officer', 'IT', 'Full-time', '2025-02-02', '0000-00-00', 'Kampala', 1, 'Grade 3', 'SFTGNBVGG123RF'),
(5, 'emp003', 'Ireen Kemigisa', 'ireen@gmail.com', '0781033103', 'Cfgdhty1234567', '', '2000-05-27', 'Single', 'female', 'IT security officer', 'IT', 'Full-time', '2025-02-10', '0000-00-00', 'Kampala', 3, 'Grade 1', 'Sdfrt6677899kk'),
(6, 'emp004', 'Hilda Nkwanzi', 'hilda@gmail.com', '0789103310', 'Cgfrtyu7899', '', '2003-09-15', 'Single', 'female', 'Accounting officer', 'Accounting', 'Contract', '2025-02-17', '0000-00-00', 'Kampala', 700000, 'Grade 4', 'GHJKI98OLLJJK'),
(16, 'emp005', 'Renah Samantha', 'renah@gmail.com', '0786742046', 'CFGOKIUL0098', '', '2001-02-06', 'Single', 'female', 'IT lawyer', 'Law', 'Full-time', '2025-02-10', NULL, 'Kampala', 900000, 'Grade 4', 'FGKLOPUYTR');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'admin',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `created_at`) VALUES
(2, 'admin', '$2y$10$rAzhYYlGb/uAs9gnRyy1zued6Dheny/HnGFFitulTWjyFToefNwRq', 'admin', '2025-02-23 14:51:12');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_email` (`email`),
  ADD UNIQUE KEY `employee_id` (`employee_id`),
  ADD UNIQUE KEY `phone_number` (`phone_number`),
  ADD UNIQUE KEY `national_id` (`national_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
