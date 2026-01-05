/**
 * CSV Export Utilities
 *
 * Provides functions for exporting reports to CSV format with RFC 4180 compliant
 * escaping and UTF-8 BOM for Excel compatibility.
 */

import type { ChannelHookupReport, ChannelHookupRow } from './generators/channel-hookup';
import type {
	InstrumentScheduleReport,
	InstrumentScheduleRow
} from './generators/instrument-schedule';
import type { DimmerScheduleReport, DimmerScheduleRow } from './generators/dimmer-schedule';

/**
 * UTF-8 BOM for Excel compatibility
 * Excel requires this to properly detect UTF-8 encoding
 */
const UTF8_BOM = '\ufeff';

/**
 * Escape a value for CSV according to RFC 4180
 *
 * Rules:
 * - Fields containing commas, double quotes, or newlines must be quoted
 * - Double quotes within a field are escaped by doubling them
 * - All other fields are output as-is
 *
 * @param value - The value to escape (can be any type)
 * @returns The RFC 4180 compliant escaped string
 */
export function escapeCSVValue(value: unknown): string {
	// Handle null/undefined
	if (value === null || value === undefined) {
		return '';
	}

	// Convert to string
	const str = String(value);

	// Check if escaping is needed
	const needsQuoting =
		str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r');

	if (needsQuoting) {
		// Double any existing quotes and wrap in quotes
		return `"${str.replace(/"/g, '""')}"`;
	}

	return str;
}

/**
 * Generate a CSV string from headers and rows
 *
 * @param headers - Array of column header names
 * @param rows - 2D array of row data
 * @returns RFC 4180 compliant CSV string with UTF-8 BOM
 */
export function generateCSV(headers: string[], rows: string[][]): string {
	// Escape headers
	const escapedHeaders = headers.map(escapeCSVValue);

	// Escape each cell in each row
	const escapedRows = rows.map((row) => row.map(escapeCSVValue));

	// Combine headers and rows
	const allRows = [escapedHeaders, ...escapedRows];

	// Join with CRLF (RFC 4180 standard)
	const csvContent = allRows.map((row) => row.join(',')).join('\r\n');

	// Add UTF-8 BOM for Excel compatibility
	return UTF8_BOM + csvContent;
}

/**
 * Trigger a file download in the browser
 *
 * @param content - The CSV content to download
 * @param filename - The filename for the download (without extension)
 */
export function downloadCSV(content: string, filename: string): void {
	// Create blob with CSV content
	const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });

	// Create download link
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = `${filename}.csv`;

	// Trigger download
	document.body.appendChild(link);
	link.click();

	// Cleanup
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

/**
 * Generate a filename for a report export
 *
 * @param reportType - The type of report (e.g., 'channel-hookup')
 * @param projectName - The project name
 * @returns A sanitized filename string
 */
export function generateFilename(reportType: string, projectName: string): string {
	// Sanitize project name for filename
	const sanitizedProjectName = projectName
		.replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters
		.replace(/\s+/g, '-') // Replace spaces with hyphens
		.toLowerCase()
		.substring(0, 50); // Limit length

	// Get current date
	const date = new Date();
	const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD

	return `${reportType}-${sanitizedProjectName}-${dateStr}`;
}

/**
 * Convert a ChannelHookupRow to CSV row values
 */
function channelHookupRowToCSV(row: ChannelHookupRow): string[] {
	return [
		row.channel?.toString() ?? '',
		row.dimmer?.toString() ?? '',
		row.position,
		row.unitNumber?.toString() ?? '',
		row.instrumentType,
		row.color ?? '',
		row.gobo ?? '',
		row.purpose ?? '',
		row.notes ?? ''
	];
}

/**
 * Export a Channel Hookup report to CSV
 *
 * @param report - The channel hookup report data
 * @returns The CSV content string
 */
export function exportChannelHookupCSV(report: ChannelHookupReport): string {
	const headers = [
		'Channel',
		'Dimmer',
		'Position',
		'Unit #',
		'Instrument Type',
		'Color',
		'Gobo',
		'Purpose',
		'Notes'
	];

	const rows = report.rows.map(channelHookupRowToCSV);

	return generateCSV(headers, rows);
}

/**
 * Download a Channel Hookup report as CSV
 *
 * @param report - The channel hookup report data
 */
export function downloadChannelHookupCSV(report: ChannelHookupReport): void {
	const content = exportChannelHookupCSV(report);
	const filename = generateFilename('channel-hookup', report.projectName);
	downloadCSV(content, filename);
}

/**
 * Convert an InstrumentScheduleRow to CSV row values
 */
function instrumentScheduleRowToCSV(row: InstrumentScheduleRow, position: string): string[] {
	return [
		position,
		row.unitNumber?.toString() ?? '',
		row.instrumentType,
		row.channel?.toString() ?? '',
		row.dimmer?.toString() ?? '',
		row.circuit ?? '',
		row.color ?? '',
		row.gobo ?? '',
		row.accessory ?? '',
		row.purpose ?? '',
		row.notes ?? ''
	];
}

/**
 * Export an Instrument Schedule report to CSV
 *
 * @param report - The instrument schedule report data
 * @returns The CSV content string
 */
export function exportInstrumentScheduleCSV(report: InstrumentScheduleReport): string {
	const headers = [
		'Position',
		'Unit #',
		'Instrument Type',
		'Channel',
		'Dimmer',
		'Circuit',
		'Color',
		'Gobo',
		'Accessory',
		'Purpose',
		'Notes'
	];

	const rows: string[][] = [];

	// Add instruments from each position
	for (const position of report.positions) {
		for (const instrument of position.instruments) {
			rows.push(instrumentScheduleRowToCSV(instrument, position.positionName));
		}
	}

	// Add unassigned instruments
	for (const instrument of report.unassignedInstruments) {
		rows.push(instrumentScheduleRowToCSV(instrument, 'Unassigned'));
	}

	return generateCSV(headers, rows);
}

/**
 * Download an Instrument Schedule report as CSV
 *
 * @param report - The instrument schedule report data
 */
export function downloadInstrumentScheduleCSV(report: InstrumentScheduleReport): void {
	const content = exportInstrumentScheduleCSV(report);
	const filename = generateFilename('instrument-schedule', report.projectName);
	downloadCSV(content, filename);
}

/**
 * Convert a DimmerScheduleRow to CSV row values
 */
function dimmerScheduleRowToCSV(row: DimmerScheduleRow): string[] {
	return [
		row.dimmer?.toString() ?? '',
		row.channel?.toString() ?? '',
		row.position,
		row.unitNumber?.toString() ?? '',
		row.instrumentType,
		row.circuit ?? '',
		row.purpose ?? '',
		row.wattage?.toString() ?? ''
	];
}

/**
 * Export a Dimmer Schedule report to CSV
 *
 * @param report - The dimmer schedule report data
 * @returns The CSV content string
 */
export function exportDimmerScheduleCSV(report: DimmerScheduleReport): string {
	const headers = [
		'Dimmer',
		'Channel',
		'Position',
		'Unit #',
		'Instrument Type',
		'Circuit',
		'Purpose',
		'Wattage'
	];

	const rows: string[][] = [];

	// Add instruments from each dimmer group
	for (const group of report.dimmerGroups) {
		for (const instrument of group.instruments) {
			rows.push(dimmerScheduleRowToCSV(instrument));
		}
	}

	// Add unassigned instruments
	for (const instrument of report.unassignedInstruments) {
		rows.push(dimmerScheduleRowToCSV(instrument));
	}

	return generateCSV(headers, rows);
}

/**
 * Download a Dimmer Schedule report as CSV
 *
 * @param report - The dimmer schedule report data
 */
export function downloadDimmerScheduleCSV(report: DimmerScheduleReport): void {
	const content = exportDimmerScheduleCSV(report);
	const filename = generateFilename('dimmer-schedule', report.projectName);
	downloadCSV(content, filename);
}
