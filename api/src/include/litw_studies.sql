-- phpMyAdmin SQL Dump
-- version 4.2.10
-- http://www.phpmyadmin.net
--
-- Host: localhost:8889
-- Generation Time: Jun 30, 2016 at 12:56 AM
-- Server version: 5.5.38
-- PHP Version: 5.6.2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `litw_studies`
--

-- --------------------------------------------------------

--
-- Table structure for table `litw_data`
--

CREATE TABLE `litw_data` (
`unique_id` int(40) unsigned NOT NULL,
  `internal_id` int(40) NOT NULL,
  `session_id` varchar(40) NOT NULL,
  `task_id` int(10) NOT NULL,
  `data_type` varchar(15) NOT NULL,
  `data` text NOT NULL,
  `created_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `litw_data`
--

INSERT INTO `litw_data` (`unique_id`, `internal_id`, `session_id`, `task_id`, `data_type`, `data`, `created_timestamp`) VALUES
(1, 1, '', 0, 'test', '{"response": "The API is working!"}', '2016-06-29 22:46:47');

-- --------------------------------------------------------

--
-- Table structure for table `litw_internal_id_fullname`
--

CREATE TABLE `litw_internal_id_fullname` (
  `internal_id` int(40) NOT NULL,
  `fullname` varchar(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `litw_internal_id_fullname`
--

INSERT INTO `litw_internal_id_fullname` (`internal_id`, `fullname`) VALUES
(1, 'API test'),
(2, 'LabintheWild template study');

-- --------------------------------------------------------

--
-- Table structure for table `litw_shortname_internal_id`
--

CREATE TABLE `litw_shortname_internal_id` (
  `shortname` varchar(20) NOT NULL,
`internal_id` int(40) unsigned NOT NULL,
  `created_datetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `litw_shortname_internal_id`
--

INSERT INTO `litw_shortname_internal_id` (`shortname`, `internal_id`, `created_datetime`) VALUES
('api_test', 1, '2016-06-29 22:52:54'),
('demo_experiment', 2, '2016-06-29 22:53:27');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `litw_data`
--
ALTER TABLE `litw_data`
 ADD PRIMARY KEY (`unique_id`);

--
-- Indexes for table `litw_internal_id_fullname`
--
ALTER TABLE `litw_internal_id_fullname`
 ADD PRIMARY KEY (`internal_id`);

--
-- Indexes for table `litw_shortname_internal_id`
--
ALTER TABLE `litw_shortname_internal_id`
 ADD PRIMARY KEY (`shortname`), ADD UNIQUE KEY `internal_id` (`internal_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `litw_data`
--
ALTER TABLE `litw_data`
MODIFY `unique_id` int(40) unsigned NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=3;
--
-- AUTO_INCREMENT for table `litw_shortname_internal_id`
--
ALTER TABLE `litw_shortname_internal_id`
MODIFY `internal_id` int(40) unsigned NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=3;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
