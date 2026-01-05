# LightsLite

A modern, browser-based 2D CAD application for theatrical lighting designers to create lighting plots. Built with SvelteKit, LightsLite provides an intuitive interface focused on the specific needs of lighting design while prioritizing data integrity above all else.

## Features

- **🎭 Theater-Focused Tools**: Purpose-built for lighting designers with specialized instrument symbols, hanging position types, and industry-standard paperwork generation
- **📐 2D Canvas Editor**: Pan, zoom, and draw with precise grid snapping and measurement tools
- **💡 Comprehensive Instrument Library**: Source 4, PAR, Fresnel, Moving Lights, LED fixtures and more
- **📊 Professional Reports**: Generate channel hookups, instrument schedules, dimmer schedules, and cut lists
- **💾 Auto-Save & Sync**: Never lose work with automatic saves to IndexedDB and cloud sync
- **🎨 Modern UI**: Clean, responsive interface built with Tailwind CSS and shadcn-svelte components
- **🔒 Secure**: Authentication powered by Neon Auth
- **📱 Multi-Device**: Access your projects from anywhere with cloud synchronization

## Tech Stack

- **Frontend**: SvelteKit 2 + Svelte 5, TypeScript, Tailwind CSS
- **Rendering**: SVG for crisp vector graphics at any zoom level
- **Database**: Neon Postgres (serverless)
- **ORM**: Drizzle ORM
- **Authentication**: Neon Auth
- **Deployment**: Vercel
- **Local Storage**: IndexedDB via idb

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- A Neon account ([sign up here](https://neon.tech))
- Vercel account for deployment (optional)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/lightslite.git
cd lightslite
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` with your Neon database credentials:

```env
DATABASE_URL="postgresql://[user]:[password]@[host]/[dbname]?sslmode=require"
NEON_AUTH_BASE_URL="https://ep-xxx.neonauth.c-2.us-east-2.aws.neon.build/dbname/auth"
PUBLIC_NEON_AUTH_URL="https://ep-xxx.neonauth.c-2.us-east-2.aws.neon.build/dbname/auth"
PUBLIC_APP_URL="http://localhost:5173"
```

4. Run database migrations:

```bash
pnpm drizzle-kit push
```

5. Start the development server:

```bash
pnpm dev
```

Visit `http://localhost:5173` to see the app running!

## Development

### Project Structure

```
lightslite/
├── src/
│   ├── lib/
│   │   ├── components/     # Svelte components
│   │   ├── stores/         # Svelte 5 state management
│   │   ├── db/             # Database schema & client
│   │   ├── sync/           # Sync manager for auto-save
│   │   ├── symbols/        # Instrument SVG symbols
│   │   ├── reports/        # Report generators
│   │   └── types/          # TypeScript types
│   ├── routes/             # SvelteKit routes
│   └── app.css             # Global styles
├── drizzle/                # Database migrations
├── static/                 # Static assets
└── plans/                  # Architecture docs
```

### Key Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm preview          # Preview production build
pnpm lint             # Run ESLint
pnpm format           # Format with Prettier
pnpm db:push          # Push schema changes to database
pnpm db:studio        # Open Drizzle Studio
```

### Keyboard Shortcuts

| Shortcut               | Action          |
| ---------------------- | --------------- |
| `V`                    | Select tool     |
| `H`                    | Pan tool        |
| `I`                    | Add instrument  |
| `E`                    | Add electric    |
| `B`                    | Add boom        |
| `L`                    | Draw line       |
| `R`                    | Draw rectangle  |
| `C`                    | Draw circle     |
| `Cmd/Ctrl + Z`         | Undo            |
| `Cmd/Ctrl + Shift + Z` | Redo            |
| `Cmd/Ctrl + D`         | Duplicate       |
| `Cmd/Ctrl + A`         | Select all      |
| `Cmd/Ctrl + 0`         | Fit all         |
| `Cmd/Ctrl + +/-`       | Zoom in/out     |
| `Delete/Backspace`     | Delete selected |

## Deployment

LightsLite is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add your environment variables
4. Deploy!

Vercel will automatically handle:

- SvelteKit adapter configuration
- Edge function deployment
- Automatic HTTPS
- Preview deployments for pull requests

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [SvelteKit](https://kit.svelte.dev/)
- UI components from [shadcn-svelte](https://www.shadcn-svelte.com/)
- Icons from [Lucide](https://lucide.dev/)
- Database by [Neon](https://neon.tech/)
- Inspired by professional lighting design software like Vectorworks

## Support

For questions or issues:

- Open an issue on GitHub
- Check the [architecture documentation](plans/architecture-plan.md)
- Review the [initial requirements](plans/initial-prompt.md)

---

Made with ❤️ for lighting designers
