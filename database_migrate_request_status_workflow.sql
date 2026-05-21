-- Four-step document request workflow (removes Rejected)
USE FINALUI3;

UPDATE document_requests SET request_status = 'Ongoing' WHERE request_status = 'Rejected';

ALTER TABLE document_requests
    MODIFY request_status ENUM('Ongoing', 'Approved', 'Ready to Print', 'Received') NOT NULL DEFAULT 'Ongoing';
