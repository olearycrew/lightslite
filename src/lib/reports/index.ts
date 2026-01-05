/**
 * Reports Module
 *
 * Exports report generators for creating various reports from project data,
 * as well as PDF and CSV export utilities.
 */

export {
	generateChannelHookup,
	type ChannelHookupReport,
	type ChannelHookupRow,
	type ProjectLayers
} from './generators/channel-hookup';

export {
	generateInstrumentSchedule,
	type InstrumentScheduleReport,
	type InstrumentSchedulePosition,
	type InstrumentScheduleRow
} from './generators/instrument-schedule';

export {
	generateDimmerSchedule,
	type DimmerScheduleReport,
	type DimmerScheduleRow,
	type DimmerGroup
} from './generators/dimmer-schedule';

// PDF export utilities
export {
	exportToPDF,
	prepareForPrint,
	getReportUrl,
	getReportInfo,
	REPORTS,
	type PDFExportOptions,
	type ReportType,
	type ReportInfo
} from './pdf';

// CSV export utilities
export {
	generateCSV,
	downloadCSV,
	escapeCSVValue,
	generateFilename,
	exportChannelHookupCSV,
	downloadChannelHookupCSV,
	exportInstrumentScheduleCSV,
	downloadInstrumentScheduleCSV,
	exportDimmerScheduleCSV,
	downloadDimmerScheduleCSV
} from './csv';
