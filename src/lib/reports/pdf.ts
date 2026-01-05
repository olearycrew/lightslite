/**
 * PDF Export Utilities
 *
 * Provides functions for exporting reports to PDF using the browser's
 * built-in print functionality. The reports are already styled with
 * @media print CSS rules for clean PDF output.
 */

/**
 * Report metadata for the PDF export
 */
export interface PDFExportOptions {
	/** Report title for the document */
	title?: string;
	/** Filename suggestion (without extension) */
	filename?: string;
}

/**
 * Export the current page to PDF using the browser's print dialog.
 *
 * This leverages the existing @media print styles in the report components
 * to generate clean, print-optimized PDFs. The print dialog allows users
 * to save as PDF or print directly.
 *
 * @param options - Optional configuration for the export
 * @returns void
 *
 * @example
 * ```ts
 * import { exportToPDF } from '$lib/reports/pdf';
 *
 * // Simple export
 * exportToPDF();
 *
 * // With options
 * exportToPDF({ title: 'Channel Hookup Report' });
 * ```
 */
export function exportToPDF(options?: PDFExportOptions): void {
	// Store original title
	const originalTitle = document.title;

	// Set document title for PDF filename (browsers use this as default filename)
	if (options?.title) {
		document.title = options.title;
	} else if (options?.filename) {
		document.title = options.filename;
	}

	// Trigger print dialog
	window.print();

	// Restore original title after a brief delay
	// (allows print dialog to capture the title)
	setTimeout(() => {
		document.title = originalTitle;
	}, 100);
}

/**
 * Prepare the page for PDF export by hiding non-printable elements.
 *
 * This is useful when you need more control over what gets printed
 * than the CSS @media print rules provide.
 *
 * @returns A cleanup function to restore hidden elements
 *
 * @example
 * ```ts
 * const cleanup = prepareForPrint();
 * window.print();
 * cleanup();
 * ```
 */
export function prepareForPrint(): () => void {
	// Add a class to body that can be used for additional print styling
	document.body.classList.add('printing');

	// Hide elements with no-print class that might not be hidden by CSS
	const noPrintElements = document.querySelectorAll('.no-print');
	const hiddenElements: Array<{ element: HTMLElement; display: string }> = [];

	noPrintElements.forEach((el) => {
		const element = el as HTMLElement;
		hiddenElements.push({
			element,
			display: element.style.display
		});
		element.style.display = 'none';
	});

	// Return cleanup function
	return () => {
		document.body.classList.remove('printing');
		hiddenElements.forEach(({ element, display }) => {
			element.style.display = display;
		});
	};
}

/**
 * Report types available for PDF export
 */
export type ReportType = 'channel-hookup' | 'instrument-schedule' | 'dimmer-schedule';

/**
 * Report metadata with display information
 */
export interface ReportInfo {
	/** Unique identifier for the report type */
	type: ReportType;
	/** Human-readable report name */
	name: string;
	/** Short description of the report */
	description: string;
	/** URL path segment for the report */
	path: string;
	/** Icon name (for UI display) */
	icon: 'file-text' | 'list' | 'sliders';
}

/**
 * Available reports with their metadata
 */
export const REPORTS: readonly ReportInfo[] = [
	{
		type: 'channel-hookup',
		name: 'Channel Hookup',
		description: 'Instruments organized by control channel',
		path: 'channel-hookup',
		icon: 'file-text'
	},
	{
		type: 'instrument-schedule',
		name: 'Instrument Schedule',
		description: 'Instruments organized by hanging position',
		path: 'instrument-schedule',
		icon: 'list'
	},
	{
		type: 'dimmer-schedule',
		name: 'Dimmer Schedule',
		description: 'Instruments organized by dimmer/circuit',
		path: 'dimmer-schedule',
		icon: 'sliders'
	}
] as const;

/**
 * Get the URL for a specific report
 *
 * @param projectId - The project ID
 * @param reportType - The type of report
 * @returns The full URL path to the report
 */
export function getReportUrl(projectId: string, reportType: ReportType): string {
	return `/app/${projectId}/reports/${reportType}`;
}

/**
 * Get report info by type
 *
 * @param reportType - The type of report
 * @returns The report info or undefined if not found
 */
export function getReportInfo(reportType: ReportType): ReportInfo | undefined {
	return REPORTS.find((r) => r.type === reportType);
}
