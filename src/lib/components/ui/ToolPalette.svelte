<script lang="ts">
	/**
	 * ToolPalette Component
	 *
	 * Vertical toolbar for selecting drawing tools.
	 * Shows active tool indicator and keyboard shortcuts.
	 */
	import { tool, TOOL_NAMES, type ToolType } from '$lib/stores/tool.svelte';

	// Tool configuration with icons and shortcuts
	const tools: Array<{
		id: ToolType;
		icon: string;
		shortcut: string;
		group: 'main' | 'draw' | 'place';
	}> = [
		{ id: 'select', icon: '↖', shortcut: 'V', group: 'main' },
		{ id: 'pan', icon: '✋', shortcut: 'H', group: 'main' },
		{ id: 'draw-line', icon: '╱', shortcut: 'L', group: 'draw' },
		{ id: 'draw-rect', icon: '▢', shortcut: 'R', group: 'draw' },
		{ id: 'draw-circle', icon: '○', shortcut: 'C', group: 'draw' },
		{ id: 'add-electric', icon: '⚡', shortcut: 'E', group: 'place' },
		{ id: 'add-instrument', icon: '💡', shortcut: 'I', group: 'place' }
	];

	/**
	 * Handle tool selection
	 */
	function selectTool(toolId: ToolType) {
		tool.setTool(toolId);
	}

	/**
	 * Handle keyboard shortcuts
	 */
	function handleKeyDown(event: KeyboardEvent) {
		// Don't capture if typing in an input
		const target = event.target as HTMLElement;
		if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
			return;
		}

		// Don't capture if modifier keys are held (except shift for some)
		if (event.ctrlKey || event.metaKey || event.altKey) {
			return;
		}

		const key = event.key.toUpperCase();
		const toolDef = tools.find((t) => t.shortcut === key);

		if (toolDef) {
			event.preventDefault();
			selectTool(toolDef.id);
		}
	}

	// Setup keyboard listener
	$effect(() => {
		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	});

	// Group tools for rendering with separators
	const mainTools = $derived(tools.filter((t) => t.group === 'main'));
	const drawTools = $derived(tools.filter((t) => t.group === 'draw'));
	const placeTools = $derived(tools.filter((t) => t.group === 'place'));
</script>

<div class="tool-palette">
	<!-- Main tools (select, pan) -->
	<div class="tool-group">
		{#each mainTools as toolDef (toolDef.id)}
			<button
				class="tool-button"
				class:active={tool.activeTool === toolDef.id}
				title="{TOOL_NAMES[toolDef.id]} ({toolDef.shortcut})"
				onclick={() => selectTool(toolDef.id)}
			>
				<span class="tool-icon">{toolDef.icon}</span>
				<span class="tool-shortcut">{toolDef.shortcut}</span>
			</button>
		{/each}
	</div>

	<div class="separator"></div>

	<!-- Drawing tools -->
	<div class="tool-group">
		{#each drawTools as toolDef (toolDef.id)}
			<button
				class="tool-button"
				class:active={tool.activeTool === toolDef.id}
				title="{TOOL_NAMES[toolDef.id]} ({toolDef.shortcut})"
				onclick={() => selectTool(toolDef.id)}
			>
				<span class="tool-icon">{toolDef.icon}</span>
				<span class="tool-shortcut">{toolDef.shortcut}</span>
			</button>
		{/each}
	</div>

	<div class="separator"></div>

	<!-- Placement tools -->
	<div class="tool-group">
		{#each placeTools as toolDef (toolDef.id)}
			<button
				class="tool-button"
				class:active={tool.activeTool === toolDef.id}
				title="{TOOL_NAMES[toolDef.id]} ({toolDef.shortcut})"
				onclick={() => selectTool(toolDef.id)}
			>
				<span class="tool-icon">{toolDef.icon}</span>
				<span class="tool-shortcut">{toolDef.shortcut}</span>
			</button>
		{/each}
	</div>
</div>

<style>
	.tool-palette {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 8px;
		background: var(--color-crust, #11111b);
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
		user-select: none;
	}

	.tool-group {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.separator {
		height: 1px;
		background: var(--color-surface1, #45475a);
		margin: 4px 0;
	}

	.tool-button {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		padding: 0;
		border: none;
		border-radius: 6px;
		background: transparent;
		color: var(--color-subtext1, #bac2de);
		cursor: pointer;
		transition:
			background-color 0.15s,
			color 0.15s;
	}

	.tool-button:hover {
		background: var(--color-surface0, #313244);
		color: var(--color-text, #cdd6f4);
	}

	.tool-button.active {
		background: var(--color-brand, #b4befe);
		color: var(--color-crust, #11111b);
	}

	.tool-button.active:hover {
		background: var(--color-lavender, #e7cbff);
	}

	.tool-icon {
		font-size: 18px;
		line-height: 1;
	}

	.tool-shortcut {
		position: absolute;
		bottom: 2px;
		right: 3px;
		font-size: 9px;
		font-family: system-ui, sans-serif;
		opacity: 0.6;
	}

	.tool-button.active .tool-shortcut {
		opacity: 0.8;
	}
</style>
