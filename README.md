# RepoPulse Sketch
Visualize GitHub repository stats in beautiful hand-drawn style!

## ✨ Features
- 📊 **Repository Overview**: Stars, forks, watchers, latest release info
- 📈 **Commit Activity Chart**: View commit history by week/month/year
- 🗣️ **Language Breakdown**: See what languages the repository uses
- 👥 **Contributor Leaderboard**: Top contributors to the project
- 🎨 **Beautiful Hand-drawn UI**: Sketch-style interface powered by RoughJS
- ⚡ **Fast & Lightweight**: Built with Vite + React + TypeScript

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed on your machine

### Installation
1. Clone this repository:
```bash
git clone https://github.com/your-username/RepoPulse.git
cd RepoPulse
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production
```bash
npm run build
```
The built files will be in the `dist` directory, which you can deploy to any static hosting service (Vercel, Netlify, Cloudflare Pages, your own server, etc.)

### Preview Production Build
```bash
npm run preview
```

## 🎯 Usage
1. Enter a GitHub repository in the search bar:
   - Format: `owner/repo` (e.g. `facebook/react`)
   - Or paste a full GitHub URL (e.g. `https://github.com/vercel/next.js`)

2. Press Enter or click Search
3. Explore the repository stats!
   - Switch between weekly/monthly/yearly commit views
   - Adjust the time period to see more or less history

## 📸 Markdown Embedding API
You can embed your beautiful hand-drawn repository status directly into markdown files (like a GitHub README) as an image. This requires deploying the backend server, which uses Playwright/Puppeteer to generate accurate screenshots of the UI.

1. **Start the backend server**:
   ```bash
   npm run build
   npm run server
   ```

2. **Embed anywhere using markdown syntax**: 
   ```markdown
   ![React RepoPulse Stats](https://your-domain.com/api/status?repo=owner/repo)
   ```

3. **Customize the commit chart period**:
   You can tweak the timeframe rendered in the chart by querying `period` (weekly, monthly, or yearly) and `count`.
   ```markdown
   <!-- Show the last 5 years -->
   ![React Status](https://your-domain.com/api/status?repo=owner/repo&period=yearly&count=5)
   ```

## 🛠️ Tech Stack
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components
- **RoughJS** - Hand-drawn sketch effects
- **Recharts** - Charting library
- **GitHub API** - Repository data source

## 🔑 API Notes
This app uses the public GitHub API:
- **Unauthenticated**: 60 requests per hour
- **Authenticated (with PAT)**: 5000 requests per hour

To use a Personal Access Token:
1. Generate a token here: https://github.com/settings/tokens (no scopes needed, just public access)
2. Copy `.env.example` to `.env`
3. Add your token to `VITE_GITHUB_TOKEN` in the `.env` file
4. Restart the dev server

If you hit the rate limit, wait a bit or use a PAT for higher limits.

## 📝 License
MIT License - feel free to use this project for personal or commercial purposes!

## 🤝 Contributing
Contributions are welcome! Feel free to open issues or submit pull requests.
