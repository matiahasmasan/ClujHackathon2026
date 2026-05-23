-- Tabelul cu profilul bunicului/bunicii (Contextul Medical)
CREATE TABLE seniors (
    id SERIAL PRIMARY KEY,
    caregiver_id INT REFERENCES users(id), -- Legătura cu contul nepotului
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    age INT NOT NULL,
    gender VARCHAR(20) NOT NULL, -- 'Male' sau 'Female'
    diagnoses TEXT -- Aici poți pune bolile (ex: "Hypertension, Mild Arthritis")
);

-- Tabelul cu rețeta (Programul de medicamente)
CREATE TABLE medications (
    id SERIAL PRIMARY KEY,
    senior_id INT REFERENCES seniors(id) ON DELETE CASCADE,
    medication_name VARCHAR(100) NOT NULL, -- ex: "Aspirin"
    dose VARCHAR(50) NOT NULL, -- ex: "75mg" sau "1 pill"
    scheduled_time TIME NOT NULL, -- Ora la care trebuie luată (ex: "08:00")
    is_taken_today BOOLEAN DEFAULT FALSE -- Aici este CHECKMARK-ul!
);