# StockSphere Testing Checklist

## Pre-Testing Setup
- [ ] Run `npm install` and `npx expo start`
- [ ] API key can be added directly in the app Profile section (no .env files needed)
- [ ] App works with mock data without API key and shows clear indicators
- [ ] Verify no console statements or comments in source files

## Manual Testing Checklist

### Authentication Flow
- [ ] App starts and shows user profile setup
- [ ] Can enter name and email to create profile
- [ ] User data persists between app restarts
- [ ] Can logout from Profile screen
- [ ] Profile shows user initials avatar (no emojis)

### Home Screen
- [ ] Shows popular stocks (real data with API key, mock data without)
- [ ] Displays top gainers and losers sections (real data with API key)
- [ ] Stock items display: symbol, name, price, change, change percentage
- [ ] Market status indicator (open/closed)
- [ ] Portfolio summary card with total value and gain/loss
- [ ] Quick action buttons (Search, Portfolio, Watchlist, News)
- [ ] Can tap stock item to view details
- [ ] Pull-to-refresh works
- [ ] Loading and error states work
- [ ] Time zone support
- [ ] Dynamic theme support (light/dark/system)
- [ ] Clear mock data indicators when no API key is set

### Stock Detail Screen
- [ ] Shows comprehensive stock information
- [ ] Interactive price chart with multiple timeframes (1D, 1W, 1M, 3M, 1Y, 5Y)
- [ ] Can add/remove from multiple watchlists
- [ ] Can buy stocks with custom quantity
- [ ] Real-time price updates
- [ ] Stock metrics (volume, high, low, open, previous close)
- [ ] Back navigation works

### Portfolio Screen
- [ ] Shows portfolio items with quantity and current values
- [ ] Displays purchase price vs current price with gain/loss calculation
- [ ] Shows gain/loss for each position in both amount and percentage since purchase
- [ ] Calculates total portfolio value accurately
- [ ] Shows overall portfolio performance with NaN/Infinity protection
- [ ] Can remove items from portfolio
- [ ] Pull-to-refresh updates current prices
- [ ] Performance metrics and analytics
- [ ] Proper formatting with no NaN or Infinity display
- [ ] Dynamic theme support

### Watchlist Screen
- [ ] Multiple watchlist support
- [ ] Can create new watchlists
- [ ] Can rename watchlists (long press)
- [ ] Can delete watchlists (except default)
- [ ] Shows watchlist items with real-time data
- [ ] Can remove items from watchlist
- [ ] Pull-to-refresh works
- [ ] Can tap items to view details
- [ ] Active watchlist highlighting

### Search Screen
- [ ] Can search for stocks by symbol or company name
- [ ] Real-time search with debouncing
- [ ] Shows comprehensive search results with match scores
- [ ] Can tap results to view details
- [ ] Can add stocks directly to watchlist from search
- [ ] Handles no results gracefully
- [ ] Shows stock type, region, and currency information
- [ ] Searches across all available stocks (not just subset)
- [ ] Works with both real API data and mock data fallback

### News Screen
- [ ] Shows market news articles (real with API key, mock without)
- [ ] News filtering by topics and interests
- [ ] Can tap articles to open in browser
- [ ] Pull-to-refresh loads new articles
- [ ] Handles loading states
- [ ] Sentiment analysis display
- [ ] Related ticker information

### Profile Screen
- [ ] Shows user information with editable name and email
- [ ] API key management (add, view, remove) with immediate effect
- [ ] API key validation and format checking
- [ ] User initials avatar display (no emojis)
- [ ] Theme selection (Light, Dark, System) with immediate effect
- [ ] Timezone selection and management
- [ ] App information (version, last updated)
- [ ] Data export/import functionality
- [ ] Storage usage information
- [ ] Can logout user
- [ ] Can reset entire app data
- [ ] Settings persistence
- [ ] Clear success/error messaging for all actions

## Technical Testing

### API Integration
- [ ] API calls work with valid key
- [ ] Graceful fallback to mock data without API key everywhere
- [ ] Error handling for invalid API key
- [ ] Error handling for network issues
- [ ] Rate limiting handled gracefully
- [ ] No dependency on .env files (app-managed API keys only)
- [ ] Real top gainers/losers with API key
- [ ] Mock data clearly indicated when used
- [ ] All stock searches work across full dataset

### Data Persistence
- [ ] Portfolio data saves/loads correctly
- [ ] Multiple watchlists save/load correctly
- [ ] User settings and preferences persist
- [ ] API key storage and retrieval
- [ ] App state maintained on restart
- [ ] Data backup and restore functionality

### User Experience
- [ ] Dark/Light theme support with system theme detection
- [ ] Smooth transitions and animations
- [ ] Responsive design across screen sizes
- [ ] Proper loading states and error messages
- [ ] Consistent UI/UX patterns
- [ ] Accessibility considerations
- [ ] No console statements in production build
- [ ] Clean, comment-free source code
- [ ] Proper NaN/Infinity handling in all calculations

### Navigation
- [ ] All screen transitions work smoothly
- [ ] Back navigation works properly
- [ ] Tab navigation works seamlessly
- [ ] Modal navigation and dismissal
- [ ] Deep linking support (if implemented)

### Performance
- [ ] App loads quickly
- [ ] Smooth scrolling in lists
- [ ] No memory leaks in long usage
- [ ] Charts render without lag
- [ ] Efficient data caching
- [ ] Optimized API calls

## Demo vs Production Mode

### Mock Data Mode (No API Key)
- [ ] Shows demo stocks with realistic data
- [ ] Mock news articles with clear labeling
- [ ] All features work with sample data
- [ ] Clear messaging about mock data usage
- [ ] Prompts to add API key for real data

### Live Data Mode (With API Key)
- [ ] Real-time stock prices
- [ ] Current market news
- [ ] Accurate search results
- [ ] Live market status
- [ ] Real performance metrics

## Platform Testing
- [ ] iOS (Expo Go or device)
- [ ] Android (Expo Go or device)
- [ ] Web browser (with expected limitations)

## Security & Privacy
- [ ] API keys stored securely
- [ ] No sensitive data in logs
- [ ] Proper error handling without exposing internals
- [ ] Data isolation between users

## Known Features & Limitations
- Interactive charts with multiple timeframes
- Multiple watchlist management
- Real-time data updates (with API key)
- Portfolio performance tracking
- Theme and timezone support
- No real trading functionality (demo app)
- Limited to Alpha Vantage free tier (5 API calls/minute)
- No push notifications
- No advanced technical indicators
