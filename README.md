# Fuse - Admin template and Starter project for Angular

This project was generated with [Angular CLI](https://github.com/angular/angular-cli).

## Requisitos

- Node.js 18+ (recomendado LTS)
- npm 9+

## Configuración de entorno

Revisa y ajusta el API base en:

- src/environments/environment.ts

## Desarrollo local

```bash
npm install
npm start
```

Abre http://localhost:4200/.

## Build de producción

```bash
npm run build
```

Salida en dist/.

## Deploy (hosting estático)

Este proyecto es un SPA Angular, por lo tanto necesitas:

- Servir el contenido de dist/ en un hosting estático
- Configurar fallback a index.html para rutas del SPA

### Opción 1: Vercel / Netlify / Render (estático)

1. Build command: `npm run build`
2. Output folder: `dist/`
3. Rewrite para SPA: `/* -> /index.html`

### Opción 2: Nginx

Config mínima:

```
location / {
	try_files $uri $uri/ /index.html;
}
```

### Opción 3: GitHub Pages

Si usas un subpath, construye con base-href:

```bash
ng build --base-href /<repo>/
```

Y publica el contenido de dist/.

## Tests

```bash
npm test
```

## Ayuda

Para más opciones del CLI: https://angular.io/cli
