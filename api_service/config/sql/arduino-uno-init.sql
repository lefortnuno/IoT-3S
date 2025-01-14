DROP TABLE IF EXISTS simulations;

DROP TABLE IF EXISTS users;

CREATE TABLE users (
    u_id SERIAL PRIMARY KEY,
    nom varchar(25),
    prenom varchar(100),
    date_naiss date,
    sexe boolean DEFAULT true,
    -- FALSE pour les Filles/Femmes 
    adress varchar(50),
    email varchar(50),
    pic VARCHAR(50) DEFAULT NULL
);

CREATE TABLE simulations (
    id SERIAL PRIMARY KEY,
    u_id INT,
    temperature FLOAT DEFAULT NULL,
    heart_rate INT DEFAULT NULL,
    pression INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users FOREIGN KEY ("u_id") REFERENCES users(u_id) ON DELETE CASCADE
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
        pic
    )
VALUES
    (
        1,
        'LEFORT',
        'Nomenjanahary Nuno',
        '2000-07-29',
        't',
        'Rabat-salé',
        'nunolefort6@gmail.com',
        'uploads/trofel.png'
    ),
    (
        2,
        'YAYA',
        'Mohamedhen',
        '2003-03-15',
        't',
        'Rabat-Agdal',
        'yayamohamedhen@gmail.com',
        'uploads/yaya.png'
    ),
    (
        3,
        'YOUSSAIRE',
        'Khoulia',
        '1980-01-07',
        'f',
        'Rabat-Kenitra',
        'woman@gmail.com',
        'uploads/woman.png'
    );

INSERT INTO
    simulations (u_id, temperature, heart_rate, pression)
VALUES
    (1, 41.10, 112, 98),
    (2, 41.90, 113, 95),
    (3, 40.50, 111, 91);