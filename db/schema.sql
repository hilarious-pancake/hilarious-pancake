CREATE DATABASE IF NOT EXISTS sifter;

USE sifter;

CREATE TABLE item (
  id SERIAL,
  category VARCHAR(255),
  description VARCHAR(255),
  url VARCHAR(255),
  date TIMESTAMP,
  PRIMARY KEY (id)
);