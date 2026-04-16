# GROUPONE

## Deployment

This project contains a Node.js backend and a static frontend in `public/`.

### Local development

1. Open a terminal in `GROUPONE`
2. Run `npm install`
3. Run `npm start`
4. Open `http://127.0.0.1:3002/login.html`

### Environment variables

Create a `.env` file or set these in your hosting provider:

- `PORT` (optional, default 3002)
- `MONGODB_URI`
- `SECRET_KEY`

Example:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string_here
SECRET_KEY=your_secret_key_here
```

### Deploying the backend

The app is ready to deploy to most Node.js hosts.

#### Render

1. Connect your GitHub repository.
2. Set the root directory to `GROUPONE`.
3. Use the `npm install` build command.
4. Use `npm start` as the start command.
5. Add the environment variables above in Render.

#### Railway / Heroku

- Use `GROUPONE` as the service root.
- Set `web: npm start` in `Procfile`.
- Configure `PORT`, `MONGODB_URI`, and `SECRET_KEY`.

### Docker deployment

Build and run locally with:

```bash
docker build -t cozys-platform .
docker run -p 3000:3000 --env-file .env cozys-platform
```

### Notes

- The backend serves the frontend from `public/`.
- Non-API routes are routed to `public/index.html`.
- GitHub Pages cannot run the backend; use a Node host for full login/API support.
