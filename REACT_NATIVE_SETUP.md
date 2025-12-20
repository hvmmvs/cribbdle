# React Native Setup Guide

## Prerequisites

1. **Node.js** (v18 or higher)
2. **React Native CLI**: `npm install -g react-native-cli`
3. **For iOS**: Xcode and CocoaPods
4. **For Android**: Android Studio and Android SDK

## Installation Steps

### 1. Install Dependencies

```bash
yarn install
```

### 2. Install iOS Dependencies (iOS only)

```bash
cd ios && pod install && cd ..
```

### 3. Start Flask Backend

In a separate terminal:

```bash
# Activate virtualenv
source .venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Run Flask server
python app.py
```

The Flask server should be running on `http://localhost:5555`

### 4. Configure API URL

Update the API URL in `src/screens/GameScreen.js` and `src/components/Card.js` based on your setup:

- **iOS Simulator**: `http://localhost:5555`
- **Android Emulator**: `http://10.0.2.2:5555`
- **Physical Device**: `http://YOUR_COMPUTER_IP:5555` (find your IP with `ifconfig` or `ipconfig`)

### 5. Run the App

**iOS:**
```bash
yarn ios
```

**Android:**
```bash
yarn android
```

**Start Metro Bundler separately:**
```bash
yarn start
```

## Component Structure

The app is organized into discrete, reusable components:

### Components (`src/components/`)

- **Card.js**: Individual playing card with animations
- **CardRow.js**: Horizontal scrollable row of cards
- **StatCard.js**: Single statistic display card
- **StatsSection.js**: Complete stats section with charts
- **Chart.js**: SVG-based charts (histogram, line, box plot)
- **HelpModal.js**: Modal with cribbage scoring rules
- **FeedbackBadge.js**: Success/info feedback messages

### Screens (`src/screens/`)

- **GameScreen.js**: Main game screen with all game logic

## Key Features

- ✅ Card selection (up to 4 cards)
- ✅ Hand scoring with statistics
- ✅ Optimal keep suggestions
- ✅ Crib statistics
- ✅ Interactive charts
- ✅ Help modal
- ✅ Card animations
- ✅ Responsive design

## Troubleshooting

### Images not loading
- Ensure Flask server is running
- Check API_BASE_URL matches your setup
- For Android, use `10.0.2.2` instead of `localhost`

### CORS errors
- Ensure `flask-cors` is installed: `pip install flask-cors`
- Check that CORS is enabled in `app.py`

### Metro bundler issues
- Clear cache: `yarn start --reset-cache`
- Delete `node_modules` and reinstall: `rm -rf node_modules && yarn install`

### Build errors
- For iOS: Clean build folder in Xcode
- For Android: `cd android && ./gradlew clean && cd ..`

