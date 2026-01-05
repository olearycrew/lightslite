/**
 * Reports Module
 *
 * Exports report generators for creating various reports from project data.
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
