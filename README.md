# Minimal MERN E-Commerce (Atlas + VM Deploy)

A very small MERN app for practical exam deployment:
- Browse products
- Simulate purchase
- MongoDB Atlas as database

## Tech Stack
- Frontend: React (Vite)
- Backend: Node.js + Express
- Database: MongoDB Atlas (Mongoose)

## Project Structure
- `client/` React app
- `server/` Express API + Atlas connection

## 1) Local Setup

### Backend
1. Go to `server/`
2. Create `.env` from `.env.example`
3. Add Atlas URI
4. Install and run

```bash
cd server
npm install
npm run dev
```

Example `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<dbName>?retryWrites=true&w=majority
CLIENT_URL=http://localhost:5173
```

### Frontend
1. Go to `client/`
2. Create `.env` from `.env.example`
3. Install and run

```bash
cd client
npm install
npm run dev
```

Example `client/.env`:

```env
VITE_API_URL=http://localhost:5000
```

Open: http://localhost:5173

## 2) Production Build (Frontend)

```bash
cd client
npm run build
```

This creates `client/dist`. The Express server serves this automatically in production.

## 3) Cloud VM Deployment (Ubuntu)

Use any cloud VM (AWS EC2 / Azure VM / GCP Compute Engine).

### A. Prepare VM
```bash
sudo apt update
sudo apt install -y curl git
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

### B. Copy project and install
```bash
git clone <your-repo-url>
cd ecommerce/server
npm install
cd ../client
npm install
npm run build
```

### C. Configure environment on VM
Create `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<dbName>?retryWrites=true&w=majority
CLIENT_URL=http://<your-vm-public-ip>
```

Important Atlas setting:
- In Atlas Network Access, allow VM public IP (or `0.0.0.0/0` for quick testing only).

### D. Run backend (serves frontend build too)
```bash
cd ~/ecommerce/server
npm start
```

Open in browser:
- `http://<your-vm-public-ip>:5000`

### E. Keep app running in background (recommended)
```bash
sudo npm install -g pm2
cd ~/ecommerce/server
pm2 start index.js --name ecommerce-app
pm2 save
pm2 startup
```

## API Endpoints
- `GET /api/health`
- `GET /api/products`
- `POST /api/purchase`

Purchase request body:

```json
{
  "productId": "<id>",
  "quantity": 1,
  "customerName": "Student User"
}
```

## Notes
- On first run, the server seeds 3 sample products if database is empty.
- This project is intentionally minimal and deployment-focused.
