-- Base de datos TOTEM
-- Script de creación de base de datos y tablas

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS totem_db;
USE totem_db;

-- Tabla Usuario
CREATE TABLE Usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    contrasenia VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'usuario', 'moderador') NOT NULL DEFAULT 'usuario',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla Institucion
CREATE TABLE Institucion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla Categoria
CREATE TABLE Categoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    informacion TEXT,
    icon VARCHAR(100),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla TOTEM
CREATE TABLE TOTEM (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_to VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(200) NOT NULL,
    color VARCHAR(7) NOT NULL, -- Para códigos hexadecimales como #FF5733
    institucion_id INT,
    categoria_id INT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (institucion_id) REFERENCES Institucion(id) ON DELETE SET NULL,
    FOREIGN KEY (categoria_id) REFERENCES Categoria(id) ON DELETE SET NULL
);

-- Tabla Multimedia
CREATE TABLE Multimedia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_multimedia ENUM('imagen', 'video', 'audio', 'documento') NOT NULL,
    url VARCHAR(500) NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    totem_id INT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (totem_id) REFERENCES TOTEM(id) ON DELETE CASCADE
);

-- Tabla UserChat
CREATE TABLE UserChat (
    id INT AUTO_INCREMENT PRIMARY KEY,
    totem_id INT NOT NULL,
    pregunta TEXT NOT NULL,
    respuesta TEXT,
    usuario_id INT,
    fecha_pregunta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_respuesta TIMESTAMP NULL,
    estado ENUM('pendiente', 'respondida', 'cerrada') DEFAULT 'pendiente',
    FOREIGN KEY (totem_id) REFERENCES TOTEM(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES Usuario(id) ON DELETE SET NULL
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_usuario_email ON Usuario(email);
CREATE INDEX idx_usuario_username ON Usuario(username);
CREATE INDEX idx_totem_ubicacion ON TOTEM(ubicacion);
CREATE INDEX idx_totem_institucion ON TOTEM(institucion_id);
CREATE INDEX idx_multimedia_totem ON Multimedia(totem_id);
CREATE INDEX idx_userchat_totem ON UserChat(totem_id);
CREATE INDEX idx_userchat_usuario ON UserChat(usuario_id);
CREATE INDEX idx_userchat_estado ON UserChat(estado);

-- Insertar datos de ejemplo
-- Instituciones de ejemplo
INSERT INTO Institucion (nombre) VALUES 
('Universidad Nacional'),
('Hospital Central'),
('Museo de Arte'),
('Biblioteca Pública');

-- Categorías de ejemplo
INSERT INTO Categoria (nombre, informacion, icon) VALUES 
('Información General', 'Información básica y general del lugar', 'info-icon'),
('Servicios', 'Servicios disponibles en la institución', 'services-icon'),
('Historia', 'Información histórica y cultural', 'history-icon'),
('Contacto', 'Datos de contacto y ubicación', 'contact-icon');

-- Usuarios de ejemplo
INSERT INTO Usuario (username, email, contrasenia, rol) VALUES 
('admin', 'admin@totem.com', '$2b$10$example_hash', 'admin'),
('usuario1', 'usuario1@email.com', '$2b$10$example_hash', 'usuario'),
('moderador1', 'moderador@email.com', '$2b$10$example_hash', 'moderador');

-- TOTEMs de ejemplo
INSERT INTO TOTEM (nombre_to, ubicacion, color, institucion_id, categoria_id) VALUES 
('TOTEM Principal', 'Entrada principal del edificio A', '#3498db', 1, 1),
('TOTEM Servicios', 'Planta baja, cerca de recepción', '#e74c3c', 1, 2),
('TOTEM Historia', 'Sala de exposiciones', '#2ecc71', 3, 3);

-- Multimedia de ejemplo
INSERT INTO Multimedia (tipo_multimedia, url, titulo, descripcion, totem_id) VALUES 
('imagen', 'https://example.com/imagen1.jpg', 'Logo de la institución', 'Logo oficial de la universidad', 1),
('video', 'https://example.com/video1.mp4', 'Bienvenida', 'Video de bienvenida para nuevos estudiantes', 1),
('documento', 'https://example.com/reglamento.pdf', 'Reglamento interno', 'Documento con el reglamento de la institución', 1);

-- UserChat de ejemplo
INSERT INTO UserChat (totem_id, pregunta, usuario_id) VALUES 
(1, '¿Cuáles son los horarios de atención?', 2),
(1, '¿Dónde puedo encontrar información sobre becas?', 2),
(2, '¿Qué servicios están disponibles en este piso?', 3);

-- Mostrar información de las tablas creadas
SHOW TABLES;
DESCRIBE Usuario;
DESCRIBE Institucion;
DESCRIBE Categoria;
DESCRIBE TOTEM;
DESCRIBE Multimedia;
DESCRIBE UserChat;
