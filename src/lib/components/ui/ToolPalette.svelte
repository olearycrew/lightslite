<script lang="ts">
	/**
	 * ToolPalette Component
	 *
	 * Vertical toolbar for selecting drawing tools.
	 * Shows active tool indicator and keyboard shortcuts.
	 * Built with shadcn-svelte Button and Tooltip components.
	 */
	import { tool, TOOL_NAMES, type ToolType } from '$lib/stores/tool.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { Separator } from '$lib/components/ui/separator';

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

<Tooltip.Provider>
	<div class="flex flex-col gap-1 p-2 bg-sidebar rounded-lg shadow-lg select-none">
		<!-- Main tools (select, pan) -->
		<div class="flex flex-col gap-0.5">
			{#each mainTools as toolDef (toolDef.id)}
				<Tooltip.Root>
					<Tooltip.Trigger>
						<Button
							variant={tool.activeTool === toolDef.id ? 'default' : 'ghost'}
							size="icon"
							class="w-10 h-10 relative {tool.activeTool === toolDef.id
								? 'bg-primary text-primary-foreground hover:bg-primary/90'
								: 'text-muted-foreground hover:text-foreground'}"
							onclick={() => selectTool(toolDef.id)}
						>
							<span class="text-lg">{toolDef.icon}</span>
							<span class="absolute bottom-0.5 right-1 text-[9px] opacity-60">
								{toolDef.shortcut}
							</span>
						</Button>
					</Tooltip.Trigger>
					<Tooltip.Content side="right">
						<p>{TOOL_NAMES[toolDef.id]} ({toolDef.shortcut})</p>
					</Tooltip.Content>
				</Tooltip.Root>
			{/each}
		</div>

		<Separator class="my-1" />

		<!-- Drawing tools -->
		<div class="flex flex-col gap-0.5">
			{#each drawTools as toolDef (toolDef.id)}
				<Tooltip.Root>
					<Tooltip.Trigger>
						<Button
							variant={tool.activeTool === toolDef.id ? 'default' : 'ghost'}
							size="icon"
							class="w-10 h-10 relative {tool.activeTool === toolDef.id
								? 'bg-primary text-primary-foreground hover:bg-primary/90'
								: 'text-muted-foreground hover:text-foreground'}"
							onclick={() => selectTool(toolDef.id)}
						>
							<span class="text-lg">{toolDef.icon}</span>
							<span class="absolute bottom-0.5 right-1 text-[9px] opacity-60">
								{toolDef.shortcut}
							</span>
						</Button>
					</Tooltip.Trigger>
					<Tooltip.Content side="right">
						<p>{TOOL_NAMES[toolDef.id]} ({toolDef.shortcut})</p>
					</Tooltip.Content>
				</Tooltip.Root>
			{/each}
		</div>

		<Separator class="my-1" />

		<!-- Placement tools -->
		<div class="flex flex-col gap-0.5">
			{#each placeTools as toolDef (toolDef.id)}
				<Tooltip.Root>
					<Tooltip.Trigger>
						<Button
							variant={tool.activeTool === toolDef.id ? 'default' : 'ghost'}
							size="icon"
							class="w-10 h-10 relative {tool.activeTool === toolDef.id
								? 'bg-primary text-primary-foreground hover:bg-primary/90'
								: 'text-muted-foreground hover:text-foreground'}"
							onclick={() => selectTool(toolDef.id)}
						>
							<span class="text-lg">{toolDef.icon}</span>
							<span class="absolute bottom-0.5 right-1 text-[9px] opacity-60">
								{toolDef.shortcut}
							</span>
						</Button>
					</Tooltip.Trigger>
					<Tooltip.Content side="right">
						<p>{TOOL_NAMES[toolDef.id]} ({toolDef.shortcut})</p>
					</Tooltip.Content>
				</Tooltip.Root>
			{/each}
		</div>
	</div>
</Tooltip.Provider>
