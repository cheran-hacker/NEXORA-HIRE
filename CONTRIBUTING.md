# Contributing to Nexora

Thank you for your interest in contributing to the Nexora Campus Ecosystem! This project is a massive undertaking, and we welcome contributions to add the "57th module" or fix existing issues.

## Understanding the Architecture

Nexora uses a strict Model-View-Controller (MVC) + React UI architectural pattern. Every single one of the 56 modules strictly adheres to this pipeline. When adding a new feature, you must implement it across all layers.

### The Module Pipeline

If you are adding a new feature (e.g., `CryptoDonations`), follow this exact 5-step process:

1. **Database Model (`apps/backend/src/models/CryptoDonation.js`)**
   - Create a Mongoose schema. Export the model.
2. **Controller (`apps/backend/src/controllers/cryptoController.js`)**
   - Create Express route handler functions (e.g., `getDonations`, `makeDonation`).
   - Ensure you wrap logic in `try/catch` and use the `next(error)` error handler.
3. **API Route (`apps/backend/src/routes/cryptoRoutes.js`)**
   - Map your controller functions to HTTP verbs.
   - Secure routes using the `protect` middleware from `apps/backend/src/middleware/auth.js`.
   - Register your route in `apps/backend/server.js` (e.g., `app.use('/api/crypto', cryptoRoutes)`).
4. **Frontend Service (`apps/frontend/src/services/api.js`)**
   - Create a service object that wraps `axios` calls to your new backend route.
   - Example: `export const cryptoService = { getDonations: () => api.get('/crypto') };`
5. **Frontend UI Component (`apps/frontend/src/pages/student/CryptoDonations.jsx`)**
   - Create a highly polished, responsive React component.
   - **Crucial Design Rule:** Use `lucide-react` for all icons. Avoid standard Bootstrap icons (`bi-`) to maintain the modern aesthetic.
   - Register the component in `apps/frontend/src/app/App.jsx` and add it to the relevant layout sidebar (e.g., `StudentLayout.jsx`).

## Pull Request Process

1. Fork the repository and create your branch from `main`.
2. Ensure your code follows the established aesthetic (Glassmorphism, dark/light modes).
3. If you add a new model, please update the `apps/backend/scripts/seed.js` file so your new feature is populated with mock data automatically.
4. Open a Pull Request with a clear description of the new module and screenshots of the UI.

Happy coding, and let's build the ultimate digital campus!
