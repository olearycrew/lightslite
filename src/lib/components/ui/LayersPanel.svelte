<script lang="ts">
	/**
	 * LayersPanel Component
	 *
	 * Panel for managing layer visibility, lock state, and opacity.
	 * Displays all layers with controls to toggle visibility, locking,
	 * and adjust opacity for "dimmed" effect.
	 */
	import { layers } from '$lib/stores/derived/layers.svelte';
	import { Slider } from '$lib/components/ui/forms';
	import Eye from '@lucide/svelte/icons/eye';
	import EyeOff from '@lucide/svelte/icons/eye-off';
	import Lock from '@lucide/svelte/icons/lock';
	import LockOpen from '@lucide/svelte/icons/lock-open';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Info from '@lucide/svelte/icons/info';

	// Get all layers with counts for display
	const layersWithCounts = $derived(layers.withCounts);

	// Track selected layer
	let selectedLayerId = $state<string | null>(null);

	function selectLayer(id: string) {
		selectedLayerId = selectedLayerId === id ? null : id;
	}
</script>

<div class="layers-panel">
	<div class="layers-list">
		{#each layersWithCounts as layer (layer.id)}
			<div
				class="layer-card"
				class:selected={selectedLayerId === layer.id}
				class:hidden-layer={!layer.visible}
				onclick={() => selectLayer(layer.id)}
				onkeydown={(e) => e.key === 'Enter' && selectLayer(layer.id)}
				role="button"
				tabindex="0"
			>
				<!-- Top row: color, name, count, lock -->
				<div class="layer-header">
					<div class="layer-info">
						<div class="layer-color-indicator" style:background-color={layer.color}></div>
						<span class="layer-name" title={layer.name}>
							{layer.name}
						</span>
						{#if layer.objectCount > 0}
							<span class="layer-count" title="{layer.objectCount} objects">
								({layer.objectCount})
							</span>
						{/if}
					</div>

					<!-- Lock toggle -->
					<button
						class="layer-btn"
						class:locked={layer.locked}
						onclick={(e) => {
							e.stopPropagation();
							layers.toggleLock(layer.id);
						}}
						title={layer.locked ? 'Unlock layer' : 'Lock layer'}
						disabled={layer.type === 'grid'}
					>
						{#if layer.locked}
							<Lock class="h-4 w-4" />
						{:else}
							<LockOpen class="h-4 w-4" />
						{/if}
					</button>
				</div>

				<!-- Bottom row: visibility + opacity on left, move buttons on right -->
				<div class="layer-controls-row">
					<div class="layer-opacity">
						<!-- Visibility toggle -->
						<button
							class="layer-btn"
							class:active={layer.visible}
							onclick={(e) => {
								e.stopPropagation();
								layers.toggleVisibility(layer.id);
							}}
							title={layer.visible ? 'Hide layer' : 'Show layer'}
						>
							{#if layer.visible}
								<Eye class="h-4 w-4" />
							{:else}
								<EyeOff class="h-4 w-4" />
							{/if}
						</button>
						<div class="opacity-slider-container">
							<Slider
								value={Math.round(layer.opacity * 100)}
								min={10}
								max={100}
								step={5}
								disabled={layer.type === 'grid'}
								showValue={false}
								class="opacity-slider"
								onchange={(val: number) => layers.setOpacity(layer.id, val / 100)}
							/>
						</div>
						<span class="opacity-value">{Math.round(layer.opacity * 100)}%</span>
					</div>

					<!-- Move layer controls -->
					<div class="layer-move-controls">
						<button
							class="layer-btn"
							onclick={(e) => {
								e.stopPropagation();
								layers.moveLayer(layer.id, 'up');
							}}
							title="Move layer up"
							disabled={layer.type === 'grid'}
						>
							<ChevronUp class="h-4 w-4" />
						</button>
						<button
							class="layer-btn"
							onclick={(e) => {
								e.stopPropagation();
								layers.moveLayer(layer.id, 'down');
							}}
							title="Move layer down"
							disabled={layer.type === 'grid'}
						>
							<ChevronDown class="h-4 w-4" />
						</button>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- Quick actions -->
	<div class="layer-actions">
		<button class="quick-action-btn" onclick={() => layers.showAll()}>
			<Eye class="h-4 w-4" />
			<span>Show All</span>
		</button>
		<button class="quick-action-btn" onclick={() => layers.hideAll()}>
			<EyeOff class="h-4 w-4" />
			<span>Hide All</span>
		</button>
		<button class="quick-action-btn" onclick={() => layers.unlockAll()}>
			<LockOpen class="h-4 w-4" />
			<span>Unlock All</span>
		</button>
	</div>

	<!-- Info section -->
	<div class="layer-info-section">
		<div class="info-bullet"></div>
		<p class="info-text">
			Layers help organize your plot. Use the eye icon to show/hide layers and the lock icon to
			prevent editing.
		</p>
	</div>
</div>

<style>
	.layers-panel {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.layers-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.layer-card {
		display: flex;
		flex-direction: column;
		border: 1px solid hsl(var(--border));
		border-radius: 8px;
		padding: 12px;
		background: hsl(var(--card));
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.layer-card:hover {
		border-color: hsl(var(--border) / 0.8);
	}

	.layer-card.selected {
		border-color: hsl(var(--primary));
		border-width: 2px;
		padding: 11px; /* Compensate for thicker border */
	}

	.layer-card.hidden-layer {
		opacity: 0.6;
	}

	.layer-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 8px;
	}

	.layer-info {
		display: flex;
		align-items: center;
		gap: 10px;
		min-width: 0;
		flex: 1;
		overflow: hidden;
	}

	.layer-color-indicator {
		width: 20px;
		height: 20px;
		border-radius: 4px;
		flex-shrink: 0;
	}

	.layer-name {
		font-size: 15px;
		font-weight: 600;
		color: hsl(var(--foreground));
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		flex: 1;
		min-width: 0;
	}

	.layer-count {
		font-size: 14px;
		color: hsl(var(--muted-foreground));
		flex-shrink: 0;
	}

	.layer-controls-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}

	.layer-move-controls {
		display: flex;
		align-items: center;
		gap: 2px;
		flex-shrink: 0;
	}

	.layer-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border: none;
		background: transparent;
		border-radius: 6px;
		color: hsl(var(--muted-foreground));
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.layer-btn:hover:not(:disabled) {
		background: hsl(var(--muted));
		color: hsl(var(--foreground));
	}

	.layer-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.layer-btn.active {
		color: hsl(var(--foreground));
	}

	.layer-btn.locked {
		color: hsl(var(--primary));
	}

	.layer-opacity {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: 1;
		min-width: 0;
	}

	.opacity-slider-container {
		flex: 1;
		min-width: 60px;
	}

	:global(.opacity-slider) {
		width: 100%;
	}

	.opacity-value {
		font-size: 12px;
		color: hsl(var(--foreground));
		min-width: 36px;
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	.layer-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 8px;
		padding-top: 16px;
		border-top: 1px solid hsl(var(--border));
	}

	.quick-action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		font-size: 13px;
		padding: 8px 12px;
		background: transparent;
		border: 1px solid hsl(var(--border));
		border-radius: 6px;
		color: hsl(var(--foreground));
		cursor: pointer;
		transition: all 0.15s ease;
		flex: 1;
		min-width: fit-content;
		white-space: nowrap;
	}

	.quick-action-btn:hover {
		background: hsl(var(--muted));
		border-color: hsl(var(--border) / 0.8);
	}

	.layer-info-section {
		display: flex;
		gap: 10px;
		padding: 16px;
		margin-top: 8px;
		background: hsl(var(--muted) / 0.5);
		border-radius: 8px;
	}

	.info-bullet {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: hsl(var(--primary));
		flex-shrink: 0;
		margin-top: 5px;
	}

	.info-text {
		font-size: 13px;
		color: hsl(var(--muted-foreground));
		line-height: 1.5;
		margin: 0;
	}
</style>
