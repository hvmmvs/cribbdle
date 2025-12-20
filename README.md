## Cribbdle – React Native Cribbage App

A React Native mobile app for analyzing cribbage hands, converted from the original Flask web app. **The web version still works!** You can run it in a browser or on mobile.

### Project Structure

```
cribbdle/
├── App.js                 # React Native app entry point
├── index.js              # React Native registration
├── package.json          # React Native dependencies
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Card.js       # Individual card component
│   │   ├── CardRow.js    # Row of cards
│   │   ├── Chart.js      # Statistics charts
│   │   ├── FeedbackBadge.js
│   │   ├── HelpModal.js  # Help/instructions modal
│   │   ├── StatCard.js   # Individual stat display
│   │   └── StatsSection.js # Stats section with charts
│   └── screens/
│       └── GameScreen.js  # Main game screen
├── app.py                # Flask server (serves web + API)
├── routes.py             # API endpoints + web routes
├── gameplay.py           # Cribbage game logic
├── templates/
│   └── index.html        # Original web version (still works!)
└── assets/               # Card images
```

### Running the Web Version

The original web version is still fully functional! Just run the Flask server:

```bash
# Create virtualenv (if not already done)
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run Flask server
python app.py
```

Then open `http://localhost:5555` in your browser. The web version uses the same Flask backend and works exactly as before.

### Running the React Native Mobile App

#### 1. Backend (Flask API)

The same Flask server serves both web and mobile:

```bash
# Create virtualenv
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run Flask server
export FLASK_APP=app:app
export FLASK_ENV=development
flask run --host=0.0.0.0 --port=5555
```

The Flask server now serves:
- **Web UI**: `http://localhost:5555/` (original HTML version)
- **API endpoints**: `/api/*` (for React Native mobile app)

#### 2. Frontend (React Native)

```bash
# Install dependencies
yarn install

# For iOS
yarn ios

# For Android
yarn android

# Start Metro bundler
yarn start
```

### Configuration

For the React Native mobile app, update the API base URL in `src/screens/GameScreen.js`:

```javascript
const API_BASE_URL = 'http://localhost:5555'; // Change for your setup
```

- **iOS Simulator**: `http://localhost:5555`
- **Android Emulator**: `http://10.0.2.2:5555`
- **Physical Device**: Use your computer's IP address (e.g., `http://192.168.1.100:5555`)

### Components

The React Native UI has been broken down into discrete, reusable components:

- **Card**: Displays a single playing card with flip animation
- **CardRow**: Horizontal scrollable row of cards
- **StatCard**: Displays a single statistic
- **StatsSection**: Section with multiple stats and chart
- **Chart**: Visualizes score distributions (histogram, line, box plot)
- **HelpModal**: Modal with cribbage scoring rules
- **FeedbackBadge**: Success/info feedback messages
- **GameScreen**: Main screen with game logic and state management

### Features

Both web and mobile versions support:
- Select 4 cards from 6 dealt cards
- Score hand and see statistics
- View optimal keep suggestions
- See crib statistics
- Interactive charts showing score distributions
- Help modal with scoring rules
- Card flip animations
- Responsive design

### API Endpoints

- `GET /` - Web UI (HTML page)
- `GET /api/deal` - Deal 6 random cards
- `POST /api/score` - Score a 4-card hand
- `POST /api/score/crib` - Calculate crib statistics
- `POST /api/score/breakdown` - Get detailed scoring breakdown

### Development Notes

- Card images are loaded from the `assets` folder (served by Flask)
- The web version uses D3.js for charts
- The mobile app uses React Native SVG for charts
- State management in web version is vanilla JavaScript
- State management in mobile app is React hooks
- All API calls are async and include error handling

### Which Should You Use?

- **Web Version**: Best for desktop browsers, quick testing, sharing links
- **Mobile App**: Best for native mobile experience, offline capabilities (with caching), app store distribution

Both versions use the same Flask backend and game logic!
