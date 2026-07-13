-- Create tutor_status table
CREATE TABLE IF NOT EXISTS tutor_status (
    id BIGSERIAL PRIMARY KEY,
    tutor_id BIGINT NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'OFFLINE',
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Add foreign key constraint to users table
    CONSTRAINT fk_tutor_status_user 
        FOREIGN KEY (tutor_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    
    -- Add check constraint for status values
    CONSTRAINT chk_tutor_status_values 
        CHECK (status IN ('ONLINE', 'OFFLINE'))
);

-- Create index on tutor_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_tutor_status_tutor_id ON tutor_status(tutor_id);

-- Create index on status for faster filtering
CREATE INDEX IF NOT EXISTS idx_tutor_status_status ON tutor_status(status);

-- Create index on last_updated for timestamp queries
CREATE INDEX IF NOT EXISTS idx_tutor_status_last_updated ON tutor_status(last_updated);

-- Initialize status for existing tutors (set all to OFFLINE by default)
INSERT INTO tutor_status (tutor_id, status, last_updated)
SELECT id, 'OFFLINE', CURRENT_TIMESTAMP
FROM users 
WHERE role = 'TUTOR' 
AND id NOT IN (SELECT tutor_id FROM tutor_status);
