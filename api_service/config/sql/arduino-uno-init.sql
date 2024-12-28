DROP TABLE IF EXISTS simulations;

CREATE TABLE simulations (
    id SERIAL PRIMARY KEY,
    temperature FLOAT DEFAULT NULL,
    heart_rate INT DEFAULT NULL,
    pression INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO
    simulations (temperature, heart_rate, pression)
VALUES
    (40.50, 111, 91),
    (41.10, 112, 98),
    (41.90, 113, 95);