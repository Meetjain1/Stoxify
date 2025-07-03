# Stoxify

A comprehensive React Native stock tracking and portfolio management application built with TypeScript, Redux Toolkit, and Expo. This app provides real-time stock data, interactive charts, portfolio management, and market news integration.

## Features

### Core Functionality
- **Real-time Stock Data**: Live stock prices, charts, and market analytics using Alpha Vantage API
- **Portfolio Management**: Track investments with comprehensive performance analytics
- **Watchlist Management**: Create and manage multiple custom watchlists
- **Market News**: Stay informed with latest market news and sentiment analysis
- **Search & Discovery**: Find stocks and ETFs with advanced search functionality
- **Interactive Charts**: Technical analysis with multiple timeframes
- **Dark/Light Theme**: Dynamic theme switching with system preference support

### Technical Features
- **Offline Support**: Cached data with graceful fallbacks
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Performance Optimized**: Efficient rendering with React Native best practices
- **Type Safety**: Full TypeScript implementation
- **State Management**: Redux Toolkit for predictable state updates
- **Responsive Design**: Optimized for various screen sizes

## Requirements

- Node.js 18+ and npm/yarn
- React Native development environment
- Expo CLI
- iOS Simulator (for iOS development) or Android Emulator (for Android development)
- Alpha Vantage API key (free at https://www.alphavantage.co)

## Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd StockSphere
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Start Development Server
```bash
npx expo start
```

### 4. Run on Device/Simulator
- **iOS**: Press `i` in terminal or scan QR code with camera
- **Android**: Press `a` in terminal or scan QR code with Expo Go app
- **Web**: Press `w` in terminal

## Configuration

### API Key Setup
1. Get your free API key from [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Launch the app and navigate to Profile screen
3. Enter your API key in the API Configuration section
4. Save and restart the app

### Demo Mode
The app includes mock data when no API key is configured, allowing you to explore features without an API key.

## Architecture

### Project Structure
```
StockSphere/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── CustomAlert.tsx
│   │   ├── ErrorDisplay.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── NewsItem.tsx
│   │   ├── PortfolioItem.tsx
│   │   ├── StockChart.tsx
│   │   ├── StockItem.tsx
│   │   ├── UserProfileSetup.tsx
│   │   └── WatchlistSelectorModal.tsx
│   ├── screens/             # Application screens
│   │   ├── AuthScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── WatchlistScreen.tsx
│   │   ├── NewStockDetailScreen.tsx
│   │   ├── NewsScreen.tsx
│   │   ├── PortfolioScreen.tsx
│   │   ├── SearchScreen.tsx
│   │   └── StockListScreen.tsx
│   ├── navigation/          # Navigation configuration
│   │   └── AppNavigator.tsx
│   ├── store/               # Redux store and slices
│   │   ├── index.ts
│   │   ├── stocksSlice.ts
│   │   ├── portfolioSlice.ts
│   │   ├── watchlistSlice.ts
│   │   ├── newsSlice.ts
│   │   ├── userSlice.ts
│   │   └── selectors/
│   │       └── watchlistSelectors.ts
│   ├── services/            # API and storage services
│   │   ├── apiService.ts
│   │   ├── mockData.ts
│   │   └── storageService.ts
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   │   └── index.ts
│   ├── constants/           # App constants and configuration
│   │   └── index.ts
│   └── contexts/            # React contexts
│       └── ThemeContext.tsx
├── assets/                  # Images and static files
├── App.tsx                  # Main app component
├── app.json                 # Expo configuration
├── package.json             # Dependencies
└── tsconfig.json            # TypeScript configuration
```

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        StockSphere App                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Presentation  │  │   Navigation    │  │    Themes    │ │
│  │     Layer       │  │     Layer       │  │   Context    │ │
│  │                 │  │                 │  │              │ │
│  │ • Screens       │  │ • Tab Navigator │  │ • Light/Dark │ │
│  │ • Components    │  │ • Stack Nav     │  │ • System     │ │
│  │ • UI Elements   │  │ • Route Config  │  │   Preference │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                State Management Layer                   │ │
│  │                                                         │ │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │ │
│  │ │   Redux     │ │    Async    │ │   Local     │        │ │
│  │ │   Store     │ │   Thunks    │ │  Storage    │        │ │
│  │ │             │ │             │ │             │        │ │
│  │ │ • Stocks    │ │ • API Calls │ │ • User Data │        │ │
│  │ │ • Portfolio │ │ • Data Sync │ │ • Settings  │        │ │
│  │ │ • Watchlist │ │ • Error     │ │ • Cache     │        │ │
│  │ │ • News      │ │   Handling  │ │             │        │ │
│  │ │ • User      │ │             │ │             │        │ │
│  │ └─────────────┘ └─────────────┘ └─────────────┘        │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                  Business Logic Layer                   │ │
│  │                                                         │ │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │ │
│  │ │    Utils    │ │  Services   │ │ Validators  │        │ │
│  │ │             │ │             │ │             │        │ │
│  │ │ • Formatters│ │ • API Client│ │ • Email     │        │ │
│  │ │ • Calculators│ │ • Storage   │ │ • Symbols   │        │ │
│  │ │ • Helpers   │ │ • Mock Data │ │ • Forms     │        │ │
│  │ └─────────────┘ └─────────────┘ └─────────────┘        │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    Data Layer                           │ │
│  │                                                         │ │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │ │
│  │ │ Alpha       │ │    Cache    │ │  Offline    │        │ │
│  │ │ Vantage     │ │   Manager   │ │   Support   │        │ │
│  │ │    API      │ │             │ │             │        │ │
│  │ │             │ │ • Response  │ │ • Fallbacks │        │ │
│  │ │ • Real-time │ │   Caching   │ │ • Mock Data │        │ │
│  │ │   Stock Data│ │ • TTL       │ │ • Graceful  │        │ │
│  │ │ • News Feed │ │   Management│ │   Degradation│        │ │
│  │ │ • Search    │ │             │ │             │        │ │
│  │ └─────────────┘ └─────────────┘ └─────────────┘        │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Interaction**: User interacts with screens/components
2. **Action Dispatch**: Components dispatch Redux actions
3. **Async Thunks**: Actions trigger API calls or storage operations
4. **State Updates**: Reducers update the global state
5. **Re-rendering**: Components re-render based on state changes
6. **Persistence**: Critical data is persisted to AsyncStorage

### Key Design Patterns

- **Redux Toolkit**: Simplified Redux with built-in best practices
- **TypeScript**: Full type safety across the application
- **Component Composition**: Reusable, composable UI components
- **Custom Hooks**: Encapsulated logic for theme and state management
- **Error Boundaries**: Graceful error handling and recovery
- **Separation of Concerns**: Clear boundaries between UI, logic, and data

## Usage Guide

### Getting Started
1. **Setup**: Install the app and configure your API key
2. **Explore**: Browse the home screen to see top gainers/losers
3. **Search**: Use the search function to find specific stocks
4. **Track**: Add stocks to your watchlist for easy monitoring
5. **Invest**: Add stocks to your portfolio to track performance

### Main Features

#### Home Screen
- View market overview with top gainers and losers
- Quick access to your portfolio summary
- Navigate to different sections of the app
- Real-time market status indicator

#### Watchlist Management
- Create multiple custom watchlists
- Add/remove stocks from watchlists
- Rename and organize your watchlists
- View real-time price updates

#### Portfolio Tracking
- Add stock purchases with quantity and price
- Track overall portfolio performance
- View individual stock gains/losses
- Portfolio allocation insights

#### Stock Details
- Comprehensive stock information
- Interactive price charts
- Historical performance data
- Add to watchlist or portfolio
- Related news and analysis

#### Market News
- Latest market news feed
- Sentiment analysis indicators
- Filter by categories and topics
- Stock-specific news

#### Profile & Settings
- Manage your API key
- Switch between light/dark themes
- Update personal information
- Reset app data

### Pro Tips
- Use the search function to quickly find stocks
- Create themed watchlists (e.g., "Tech Stocks", "Dividends")
- Regularly update your portfolio with new purchases
- Check the news section for market insights
- Enable dark mode for better viewing in low light

## Building for Production

### Creating a Development Build

```bash
# Create development build
npx expo build:android
# or
npx expo build:ios
```

### Creating a Production APK

#### Method 1: Using EAS Build (Recommended)

1. **Install EAS CLI**
```bash
npm install -g @expo/eas-cli
```

2. **Login to Expo**
```bash
eas login
```

3. **Configure Build**
```bash
eas build:configure
```

4. **Build APK**
```bash
# For Android APK
eas build --platform android --profile preview

# For production AAB
eas build --platform android --profile production
```

5. **Download APK**
The build process will provide a download link for your APK file.

#### Method 2: Using Expo Classic Build

1. **Build APK**
```bash
expo build:android -t apk
```

2. **Download**
Follow the provided link to download your APK once the build completes.

#### Method 3: Local Development Build

1. **Prebuild**
```bash
npx expo prebuild
```

2. **Build with Gradle**
```bash
cd android
./gradlew assembleRelease
```

3. **Find APK**
The APK will be located at: `android/app/build/outputs/apk/release/app-release.apk`

### Build Configuration

Ensure your `app.json` is properly configured:

```json
{
  "expo": {
    "name": "Stoxify",
    "slug": "stoxify",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.yourname.stoxify"
    }
  }
}
```

## Performance Optimization

### Implemented Optimizations
- **FlatList**: For efficient rendering of large lists
- **Image Optimization**: Proper image sizing and lazy loading
- **State Management**: Efficient Redux store structure
- **Memoization**: React.memo for expensive components
- **Code Splitting**: Proper component organization
- **Async Storage**: Efficient data persistence

### Best Practices
- Use TypeScript for type safety
- Implement proper error boundaries
- Use React Navigation best practices
- Optimize bundle size with proper imports
- Profile performance with React DevTools

## Testing

### Manual Testing Checklist
- [ ] Authentication flow works correctly
- [ ] API key setup and validation
- [ ] Stock search functionality
- [ ] Watchlist creation and management
- [ ] Portfolio tracking and calculations
- [ ] News feed loading and display
- [ ] Theme switching (light/dark/system)
- [ ] Offline graceful degradation
- [ ] Error handling and user feedback

### Testing on Different Platforms
- [ ] iOS (Simulator and device)
- [ ] Android (Emulator and device)
- [ ] Different screen sizes
- [ ] Various network conditions

## Troubleshooting

### Common Issues

#### API Key Issues
- **Problem**: "Invalid API key" error
- **Solution**: Verify key is correct and has sufficient quota

#### Network Errors
- **Problem**: App shows offline state
- **Solution**: Check internet connection and API availability

#### Performance Issues
- **Problem**: Slow loading or crashes
- **Solution**: Restart app, check device memory

#### Build Errors
- **Problem**: Build fails
- **Solution**: Clear cache with `npx expo start --clear`

### Debug Mode
Enable debug mode by shaking your device or pressing `Cmd+D` (iOS) / `Cmd+M` (Android) to access developer menu.

## Dependencies

### Core Dependencies
- **React Native**: Cross-platform mobile framework
- **Expo**: Development platform and tools
- **TypeScript**: Type safety and developer experience
- **Redux Toolkit**: State management
- **React Navigation**: Navigation library
- **React Native Chart Kit**: Chart visualization

### Development Dependencies
- **@types/\***: TypeScript definitions
- **ESLint**: Code linting
- **Prettier**: Code formatting

## API Integration

### Alpha Vantage API
The app integrates with Alpha Vantage API for:
- Real-time stock quotes
- Historical price data
- Company information
- Market news and sentiment
- Stock search functionality

### Rate Limits
- Free tier: 5 API calls per minute, 500 per day
- Premium tiers available for higher limits

### Fallback Strategy
When API is unavailable:
- Display cached data
- Show mock data for demonstration
- Graceful error messages
- Offline mode indicators

## Security

### Data Protection
- API keys stored securely in device storage
- No sensitive data transmitted in plain text
- Local data encrypted where applicable
- User privacy respected

### Best Practices
- Input validation on all forms
- Secure API communication
- Error messages don't expose system details
- Regular dependency updates

## License

This project is created for educational/assignment purposes. All third-party services and APIs are subject to their respective terms of service.

## Support

For technical issues or questions about this implementation, please refer to the detailed codebase explanation document included with this project.
