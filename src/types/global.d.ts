declare global {
    const api: typeof import("../api").default;
	const MAIN_WINDOW_WEBPACK_ENTRY: string;
	const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
}

export {};