# GitHub Followex

**A network visualization tool for GitHub follower/following relationships**

![GitHub Followex Demo](https://img.shields.io/badge/D3.js-v7-orange) ![Node.js](https://img.shields.io/badge/Node.js-v18+-green) ![License](https://img.shields.io/badge/License-MIT-blue)

**Language**: [English](README.md) | [日本語](README_JP.md)

## About This Tool

GitHub Followex visualizes GitHub follower and following relationships as an interactive graph. It collects data from the GitHub API and displays users as nodes connected by their follow relationships.

### Features

- Interactive graph visualization with zoom, pan, and drag controls
- Displays GitHub profile avatars in nodes
- Node size and color based on follower count
- Hover tooltips showing user information
- Supports large networks through optimization techniques

## Quick Start

### 1. Environment Setup

```bash
# Check Node.js version (v18+ required)
node --version

# Install dependencies
npm install
```

### 2. GitHub Token Configuration

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select the following scopes:
   - `read:user` - Read user information
   - `user:follow` - Read follow relationships
4. Copy the token and create a `.env` file:

```bash
# Create .env file
GITHUB_TOKEN=your_github_token_here
```

### 3. Data Collection and Visualization

```bash
# 1. Collect GitHub data and generate graph data
node index.js

# 2. Open index.html in your browser to view the visualization
```

## Project Structure

```
Followex/
├── index.js          # Main data collection script
├── graph.js           # D3.js visualization logic
├── index.html         # Web interface
├── package.json       # Project configuration
├── .env              # Environment variables (GitHub token)
├── graph.json        # Generated graph data
└── README.md         # This file
```

## Configuration

### Change Target User

Edit the following line in `index.js`:

```javascript
// Root username for analysis
const rootUsername = "your_username_here";
```

### Adjust Network Size

To control network size, adjust the exploration depth:

```javascript
// Inside buildGraph function
const MAX_DEPTH = 2; // Exploration depth limit (default: 2)
```

### Limit User Count

To improve performance, limit the number of users processed per account:

```javascript
// Inside buildGraph function
for (const follower of followers.slice(0, 10)) { // Process up to 10 users
```

## Understanding the Visualization

### Node Representation
- Size: Proportional to follower count (two-stage scale based on median)
- Color: Gradient based on follower count (Viridis color scale)
- Image: GitHub profile avatar (circular clipping)

### Edge Representation
- Direction: Arrow indicates follow relationship
- Color: Gray with 60% opacity

### Interactions
- Zoom: Mouse wheel to zoom in/out
- Pan: Drag background to move the view
- Node Movement: Drag nodes to reposition them
- Tooltips: Hover over nodes for detailed information

## Technology Stack

- Backend: Node.js
- Graph Library: graphlib
- HTTP Client: axios
- Frontend: D3.js v7
- API: GitHub REST API v3

## Performance Optimizations

### API Rate Limiting Solutions
- Caching system prevents duplicate data fetching
- Duplicate prevention skips already processed users
- Limited exploration caps depth and user count

### Visualization Optimizations
- Physics simulation with collision detection and force models
- Level-based display controls label visibility based on zoom level
- Optimized SVG elements for rendering

## Troubleshooting

### Avatar Images Not Displaying

If GitHub avatars fail to load, default icons are automatically displayed. Check your network connection.

### API Rate Limit Errors

```
Error: Request failed with status code 403
```

If you see this error:
- Verify your GitHub Personal Access Token is correctly configured
- If rate limit is reached, wait before retrying

### No Data Displayed

```
No nodes data found!
```

If you see this message:
- Verify the specified username exists
- Private accounts may not provide accessible information

### Memory Issues

- Reduce exploration depth (MAX_DEPTH = 1)
- Limit user count to around 5 per account

## Data Format

Example structure of generated `graph.json`:

```json
{
  "nodes": [
    {
      "id": "username",
      "followers_count": 1250,
      "following_count": 180,
      "public_repos": 45
    }
  ],
  "links": [
    {
      "source": "follower_username",
      "target": "followed_username"
    }
  ]
}
```

## Contributing

Contributions are welcome:

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

This project uses the following open source libraries:

- [D3.js](https://d3js.org/) - Data visualization library
- [GitHub API](https://docs.github.com/en/rest) - Data provider
- [graphlib](https://github.com/dagrejs/graphlib) - Graph data structure processing

---

**Developer**: Nanashi_pi  
**Version**: 1.0.0  
**Last Updated**: June 23, 2025
