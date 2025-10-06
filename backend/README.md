TOTEM Backend (Node.js + Express + MySQL)
========================================

Requisitos
----------
- Node.js 18+
- MySQL 8+

Configuración
-------------
1. Crear la base de datos ejecutando `totem.sql` en MySQL.
2. Copiar `env.sample` a `.env` y ajustar credenciales.

Instalación
-----------
```bash
npm install
npm run dev
```

Endpoints
---------
- GET `/health`
- API base: `/api`
  - `/usuarios`
  - `/instituciones`
  - `/categorias`
  - `/totems`
  - `/multimedia`
  - `/userchat`

Cada recurso soporta: GET (lista), GET `/:id`, POST, PATCH `/:id`, DELETE `/:id`.

Notas
-----
- El campo `contrasenia` en `Usuario` debe almacenarse hasheado en la app real.
- Ajusta `APP_ORIGIN` para CORS si usas frontend.


