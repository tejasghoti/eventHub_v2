g-- Database setup for EventHub application

-- Use the event-mangement-system database
USE `event-mangement-system`;

-- Create events table
CREATE TABLE IF NOT EXISTS `events` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `date` DATE NOT NULL,
  `time` TIME NOT NULL,
  `venue` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `total_tickets` INT NOT NULL,
  `available_tickets` INT NOT NULL,
  `ticket_price` DECIMAL(10, 2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create purchases table
CREATE TABLE IF NOT EXISTS `purchases` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `event_id` INT NOT NULL,
  `purchase_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `amount` DECIMAL(10, 2) NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'Completed',
  `attendee_name` VARCHAR(255) NOT NULL,
  `attendee_email` VARCHAR(255) NOT NULL,
  `attendee_phone` VARCHAR(50),
  `payment_method` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
);

-- Insert sample events data (optional)
INSERT INTO `events` (`title`, `description`, `date`, `time`, `venue`, `category`, `total_tickets`, `available_tickets`, `ticket_price`) VALUES
('Tech Conference 2025', 'Annual technology conference featuring top industry speakers', '2025-11-15', '09:00:00', 'Convention Center', 'Technology', 200, 50, 99.99),
('Music Festival 2025', 'Weekend music festival with multiple stages and artists', '2025-12-02', '14:00:00', 'Central Park', 'Music', 500, 120, 79.99);

-- Insert sample purchase data (optional)
INSERT INTO `purchases` (`event_id`, `amount`, `status`, `attendee_name`, `attendee_email`, `attendee_phone`, `payment_method`) VALUES
(1, 99.99, 'Completed', 'John Doe', 'john@example.com', '123-456-7890', 'credit');
