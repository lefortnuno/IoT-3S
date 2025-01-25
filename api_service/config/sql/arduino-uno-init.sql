DROP TABLE IF EXISTS simulations;

DROP TABLE IF EXISTS appareils;

DROP TABLE IF EXISTS users;

CREATE TABLE users (
    u_id SERIAL PRIMARY KEY,
    nom varchar(25),
    prenom varchar(100),
    date_naiss date,
    sexe boolean DEFAULT true,
    sante boolean DEFAULT true,
    -- FALSE: Filles/Femmes | malade 
    adress varchar(50),
    email varchar(50)
);

CREATE TABLE simulations (
    id SERIAL PRIMARY KEY,
    u_id INT,
    temperature FLOAT DEFAULT NULL,
    heart_rate INT DEFAULT NULL,
    pression INT DEFAULT NULL,
    coms VARCHAR(150) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users FOREIGN KEY ("u_id") REFERENCES users(u_id) ON DELETE CASCADE
);

CREATE TABLE appareils (
    id SERIAL PRIMARY KEY,
    libelle VARCHAR(50) NOT NULL,
    spec VARCHAR(50) DEFAULT NULL,
    etat BOOLEAN DEFAULT true,
    -- FALSE: Endommagé
    u_id INT UNIQUE,
    CONSTRAINT fk_users_appareil FOREIGN KEY (u_id) REFERENCES users(u_id) ON DELETE
    SET
        NULL
);

INSERT INTO
    users (
        u_id,
        nom,
        prenom,
        date_naiss,
        sexe,
        adress,
        email,
        sante
    )
VALUES
    (
        1,
        'BENABOUB',
        'Hafssa',
        '1975-05-17',
        'f',
        'Rabat-salé',
        'benaboud@um5r.ac.ma',
        't'
    ),
    (
        2,
        'YAYA',
        'Mohamedhen',
        '2003-03-15',
        't',
        'Rabat-Agdal',
        'yayamohamedhen@gmail.com',
        't'
    ),
    (
        3,
        'YOUSSRA',
        'Khoulai',
        '1980-01-07',
        'f',
        'Rabat-Kenitra',
        'woman@gmail.com',
        'f'
    ),
    (
        4,
        'LEFORT',
        'Nomenjanahary Nuno',
        '2000-07-29',
        't',
        'Rabat-Tabriquet',
        'nunolefort6@gmail.com',
        't'
    );

INSERT INTO
    simulations (u_id, temperature, heart_rate, pression)
VALUES
    (1, 32.10, 61, 86),
    (2, 33.90, 35, 87),
    (3, 39.90, 48, 95),
    (4, 33.50, 63, 88);

INSERT INTO
    appareils (libelle, spec, u_id)
VALUES
    ('Adruino-Uno', 'R3, ATmega328P, 5V', 1),
    ('Adruino-Uno', 'R2, ATmega121Y, 3V', 2),
    (
        'Bague Samsung',
        'Galaxy Ring, Bluetooth, 5 jours',
        3
    ),
    ('Apple watch', 'Series 8, GPS, ECG', 4);

INSERT INTO
    simulations (
        u_id,
        temperature,
        heart_rate,
        pression,
        created_at
    )
VALUES
    (1, 36.10, 61, 96, '2025-01-22'),
    (1, 36.90, 65, 97, '2025-01-22'),
    (1, 37.90, 68, 95, '2025-01-22'),
    (1, 36.50, 73, 92, '2025-01-22'),
    (1, 36.10, 61, 96, '2025-01-23'),
    (1, 36.90, 65, 97, '2025-01-23'),
    (1, 37.90, 68, 95, '2025-01-23'),
    (1, 36.50, 73, 92, '2025-01-23'),
    (2, 36.10, 61, 96, '2025-01-22'),
    (2, 36.90, 65, 97, '2025-01-22'),
    (2, 37.90, 68, 95, '2025-01-22'),
    (2, 36.50, 73, 92, '2025-01-22'),
    (2, 36.10, 61, 96, '2025-01-23'),
    (2, 36.90, 65, 97, '2025-01-23'),
    (2, 37.90, 68, 95, '2025-01-23'),
    (2, 36.50, 73, 92, '2025-01-23'),
    (3, 36.10, 61, 96, '2025-01-22'),
    (3, 36.90, 65, 97, '2025-01-22'),
    (3, 37.90, 68, 95, '2025-01-22'),
    (3, 36.50, 73, 92, '2025-01-22'),
    (3, 36.10, 61, 96, '2025-01-23'),
    (3, 36.90, 65, 97, '2025-01-23'),
    (3, 37.90, 68, 95, '2025-01-23'),
    (3, 36.50, 73, 92, '2025-01-23'),
    (4, 36.10, 61, 96, '2025-01-22'),
    (4, 36.90, 65, 97, '2025-01-22'),
    (4, 37.90, 68, 95, '2025-01-22'),
    (4, 36.50, 73, 92, '2025-01-22'),
    (4, 36.10, 61, 96, '2025-01-23'),
    (4, 36.90, 65, 97, '2025-01-23'),
    (4, 37.90, 68, 95, '2025-01-23'),
    (4, 36.50, 73, 92, '2025-01-23');