// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

// Declare environment variables for type checking
// These are populated from .env files and Vercel environment settings
declare module '$env/static/private' {
	export const DATABASE_URL: string;
}

export {};
