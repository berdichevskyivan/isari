# Isari AI

## Building Phase

Isari AI is a platform designed to enhance workforce productivity using AI. This project is currently in the building phase.

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [Python](https://www.python.org/)
- [pip](https://pip.pypa.io/en/stable/)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/isari-ai.git
   cd isari-ai
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Running the Project

#### Node.js Server

1. Start the Node.js server:
   ```bash
   node backend/node/server.js
   ```

#### Python Server

1. Start the Python server:
   ```bash
   python backend/python/server.py
   ```

#### Frontend Development Server

1. Start the frontend development server:
   ```bash
   npm run dev
   ```

### Project Structure

```
isari-ai/
├── backend/
│   ├── node/
│   │   ├── server.js
│   │   └── ...
│   ├── python/
│   │   ├── server.py
│   │   └── ...
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── App.jsx
│   ├── index.css
│   ├── index.jsx
│   └── ...
├── public/
├── package.json
├── requirements.txt
├── README.md
├── LICENSE
└── ...
```

### Usage

1. **Frontend**: Open your browser and navigate to `http://localhost:5173` to interact with the application.
2. **Node.js API**: The Node.js server runs on `http://localhost:3000` and handles core backend logic.
3. **Python API**: The Python server runs on `http://localhost:3001` and handles data analysis tasks.

### API Endpoints

- **Node.js Backend**:
  - `POST /createWorker`: Create a new worker profile.

- **Python Backend**:
  - `POST /analyzeWorkerData`: Analyze worker data.

### Contributing

Contributions are welcome! Please fork the repository and submit a pull request for review.

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Contact

For any inquiries or issues, please contact [berdichevskyivan@gmail.com].