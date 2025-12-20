## Cribbdle – React Native Cribbage App

A React Native mobile app for analyzing cribbage hands, converted from the original Flask web app.

### Project Structure

```
cribbdle/
├── App.js                 # Main app entry point
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
├── app.py                # Flask API server
├── routes.py             # API endpoints
├── gameplay.py           # Cribbage game logic
└── assets/               # Card images
```

### Setup

#### 1. Backend (Flask API)

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

The Flask server now serves as an API-only backend. CORS is enabled for React Native.

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

Update the API base URL in `src/screens/GameScreen.js`:

```javascript
const API_BASE_URL = 'http://localhost:5555'; // Change for your setup
```

For Android emulator, use `http://10.0.2.2:5555`
For iOS simulator, use `http://localhost:5555`
For physical device, use your computer's IP address (e.g., `http://192.168.1.100:5555`)

### Components

The UI has been broken down into discrete, reusable components:

- **Card**: Displays a single playing card with flip animation
- **CardRow**: Horizontal scrollable row of cards
- **StatCard**: Displays a single statistic
- **StatsSection**: Section with multiple stats and chart
- **Chart**: Visualizes score distributions (histogram, line, box plot)
- **HelpModal**: Modal with cribbage scoring rules
- **FeedbackBadge**: Success/info feedback messages
- **GameScreen**: Main screen with game logic and state management

### Features

- Select 4 cards from 6 dealt cards
- Score hand and see statistics
- View optimal keep suggestions
- See crib statistics
- Interactive charts showing score distributions
- Help modal with scoring rules
- Card flip animations
- Responsive design

### API Endpoints

- `GET /api/deal` - Deal 6 random cards
- `POST /api/score` - Score a 4-card hand
- `POST /api/score/crib` - Calculate crib statistics
- `POST /api/score/breakdown` - Get detailed scoring breakdown

### Development Notes

- Card images are loaded from the `assets` folder
- The app uses React Native SVG for charts
- State management is handled in the GameScreen component
- All API calls are async and include error handling
