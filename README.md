# NASA API Explorer 🚀

A comprehensive web application that showcases various NASA APIs through an interactive and modern interface. Explore the cosmos through astronomy images, Mars rover photos, near-earth objects, Earth imagery, exoplanets, and space weather data.

## 🌟 Features

### 🌌 Astronomy Picture of the Day (APOD)
- Daily featured space images with detailed explanations
- Browse historical images by date
- Random image gallery with interactive grid
- Full-screen image viewing with modal
- **Enhanced social sharing and download features**
- **Copy link, share, and set as wallpaper functionality**
- Keyboard shortcuts for quick navigation

### 🚀 Mars Rover Photos
- Photos from Curiosity, Opportunity, Spirit, and Perseverance rovers
- Filter by camera type and Sol (Mars day)
- Rover mission information and statistics
- Interactive rover comparison
- Photo metadata and details

### ☄️ Near Earth Objects (Asteroids)
- Track asteroids and comets approaching Earth
- Filter by potentially hazardous objects
- Real-time statistics and close approach data
- Sort by various parameters (size, distance, velocity)
- Timeline of upcoming approaches

### 🌍 Earth Imagery
- Satellite images from NASA's Landsat program
- Location-based image search with coordinates
- Quick location buttons for major cities
- Date-based image retrieval
- Before/after comparison mode

### 🪐 Exoplanets
- **Real NASA Exoplanet Archive API integration**
- Comprehensive catalog of confirmed exoplanets with live data
- Advanced search and filtering capabilities
- Habitability scoring and planet classification
- Discovery statistics and trends visualization
- Multiple viewing modes (grid, list, chart)

### ⚡ Space Weather
- **Real-time space weather monitoring with NASA DONKI API**
- Current solar wind conditions and space weather status
- Solar flare, CME, and geomagnetic storm tracking
- Aurora forecast and visibility predictions
- Satellite health monitoring
- Interactive space weather alerts and warnings

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Custom CSS with CSS Grid and Flexbox
- **Fonts**: Google Fonts (Orbitron, Inter)
- **APIs**: 
  - NASA Open Data Portal
  - NASA Exoplanet Archive
  - Various NASA mission APIs

## 📁 Project Structure

```
NASA-API-Projects/
├── index.html              # Main landing page
├── assets/
│   └── nasa-logo.svg       # NASA logo
├── pages/
│   ├── apod.html           # Astronomy Picture of the Day
│   ├── mars-rover.html     # Mars Rover Photos
│   ├── asteroids.html      # Near Earth Objects
│   ├── earth-imagery.html  # Earth Satellite Imagery
│   ├── exoplanets.html     # Exoplanet Catalog
│   └── space-weather.html  # Space Weather Monitor
├── styles/
│   ├── main.css            # Global styles and components
│   ├── apod.css            # APOD page styles
│   ├── mars-rover.css      # Mars rover page styles
│   ├── asteroids.css       # Asteroids page styles
│   ├── earth-imagery.css   # Earth imagery page styles
│   ├── exoplanets.css      # Exoplanets page styles
│   └── space-weather.css   # Space weather page styles
├── scripts/
│   ├── main.js             # Core JavaScript and API client
│   ├── apod.js             # APOD functionality
│   ├── mars-rover.js       # Mars rover functionality
│   ├── asteroids.js        # NEO functionality
│   ├── earth-imagery.js    # Earth imagery functionality
│   ├── exoplanets.js       # Exoplanets functionality
│   └── space-weather.js    # Space weather functionality
└── README.md               # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser with JavaScript enabled
- NASA API key (recommended) - Get one at [api.nasa.gov](https://api.nasa.gov/)

### Quick Start
1. Clone or download this repository
2. Open `index.html` in your web browser, or
3. Serve using Python: `python -m http.server 8000`
4. Navigate to `http://localhost:8000`

### Using VS Code
1. Open the project in VS Code
2. Install the "Live Server" extension (optional)
3. Use the VS Code task "Serve NASA API Website" or run `Ctrl+Shift+P` > "Tasks: Run Task"

## ✅ Project Status

**COMPLETED** - All features implemented and tested:

- ✅ Main landing page with navigation
- ✅ APOD page with real NASA API integration and social features
- ✅ Mars Rover photos with comprehensive filtering
- ✅ Near Earth Objects tracking with real-time data
- ✅ Earth Imagery with location-based search
- ✅ **Exoplanets with real NASA Exoplanet Archive API**
- ✅ **Space Weather with real NASA DONKI API**
- ✅ Responsive design for all devices
- ✅ Interactive features and keyboard shortcuts
- ✅ Error handling and loading states
- ✅ Modern CSS with animations and transitions

## 🌐 Deployment

The website is ready for deployment to any static hosting service:

### GitHub Pages
1. Push to GitHub repository
2. Go to repository Settings > Pages
3. Select source branch (usually `main`)
4. Your site will be available at `https://username.github.io/repository-name`

### Netlify
1. Drag and drop the project folder to [netlify.com](https://netlify.com)
2. Or connect your GitHub repository for automatic deployments

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts for deployment

### Other Hosting Options
- Any static hosting service (AWS S3, Firebase Hosting, etc.)
- Local development server for testing

## 🔧 Configuration

### API Keys
Replace `DEMO_KEY` with your NASA API key in:
- `scripts/main.js` (NASAAPIClient class)
- `scripts/space-weather.js` (SpaceWeatherAPI class)

### Customization
- Modify CSS variables in `styles/main.css` for theming
- Add new API endpoints in the respective JavaScript files
- Extend functionality by adding new pages following the existing pattern

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- NASA for providing amazing APIs and data
- The astronomy community for inspiring space exploration
- All the developers and scientists making space data accessible

---

**Built with ❤️ and fascination for the cosmos** 🌌
