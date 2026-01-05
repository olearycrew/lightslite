<script lang="ts">
	/**
	 * LayersPanel Component
	 *
	 * Panel for managing layer visibility, lock state, and opacity.
	 * Displays all layers with controls to toggle visibility, locking,
	 * and adjust opacity for "dimmed" effect.
	 */
	import { layers } from '$lib/stores/derived/layers.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Slider } from '$lib/components/ui/forms';
	import { CollapsibleSection } from '$lib/components/ui/forms';
	import Eye from '@lucide/svelte/icons/eye';
	import EyeOff from '@lucide/svelte/icons/eye-off';
	import Lock from '@lucide/svelte/icons/lock';
	import LockOpen from '@lucide/svelte/icons/lock-open';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';

	// Get all layers with counts for display
	const layersWithCounts = $derived(layers.withCounts);
</script>

<div class="layers-panel">
	<CollapsibleSection title="Layers" defaultOpen={true}>
		<div class="layers-list">
			{#each layersWithCounts as layer (layer.id)}
				<div
					class="layer-item"
					class:hidden={!layer.visible}
					class:locked={layer.locked}
					class:dimmed={layer.opacity < 1}
				>
					<!-- Layer color indicator and name -->
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

					<!-- Layer controls -->
					<div class="layer-controls">
						<!-- Move layer up -->
						<Button
							variant="ghost"
							size="icon-sm"
							onclick={() => layers.moveLayer(layer.id, 'up')}
							title="Move layer up"
							disabled={layer.type === 'grid'}
						>
							<ChevronUp class="h-3 w-3" />
						</Button>

						<!-- Move layer down -->
						<Button
							variant="ghost"
							size="icon-sm"
							onclick={() => layers.moveLayer(layer.id, 'down')}
							title="Move layer down"
							disabled={layer.type === 'grid'}
						>
							<ChevronDown class="h-3 w-3" />
						</Button>

						<!-- Visibility toggle -->
						<Button
							variant="ghost"
							size="icon-sm"
							onclick={() => layers.toggleVisibility(layer.id)}
							title={layer.visible ? 'Hide layer' : 'Show layer'}
							class={layer.visible ? '' : 'text-muted-foreground'}
						>
							{#if layer.visible}
								<Eye class="h-4 w-4" />
							{:else}
								<EyeOff class="h-4 w-4" />
							{/if}
						</Button>

						<!-- Lock toggle -->
						<Button
							variant="ghost"
							size="icon-sm"
							onclick={() => layers.toggleLock(layer.id)}
							title={layer.locked ? 'Unlock layer' : 'Lock layer'}
							class={layer.locked ? 'text-yellow-500' : ''}
							disabled={layer.type === 'grid'}
						>
							{#if layer.locked}
								<Lock class="h-4 w-4" />
							{:else}
								<LockOpen class="h-4 w-4" />
							{/if}
						</Button>
					</div>
				</div>

				<!-- Opacity slider (shown when layer is visible) -->
				{#if layer.visible && layer.type !== 'grid'}
					<div class="layer-opacity">
						<span class="opacity-label">Opacity</span>
						<Slider
							value={layer.opacity * 100}
							min={10}
							max={100}
							step={5}
							unit="%"
							onchange={(val) => layers.setOpacity(layer.id, val / 100)}
						/>
					</div>
				{/if}
			{/each}
		</div>

		<!-- Quick actions -->
		<div class="layer-actions">
			<Button variant="outline" size="sm" onclick={() => layers.showAll()} title="Show all layers">
				<Eye class="h-3 w-3 mr-1" />
				Show All
			</Button>
			<Button variant="outline" size="sm" onclick={() => layers.hideAll()} title="Hide all layers">
				<EyeOff class="h-3 w-3 mr-1" />
				Hide All
			</Button>
			<Button
				variant="outline"
				size="sm"
				onclick={() => layers.unlockAll()}
				title="Unlock all layers"
			>
				<LockOpen class="h-3 w-3 mr-1" />
				Unlock All
			</Button>
		</div>
	</CollapsibleSection>
</div>

<style>
	.layers-panel {
		width: 100%;
	}

	.layers-list {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.layer-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 6px 8px;
		border-radius: 4px;
		background: var(--color-surface0, #313244);
		transition: background-color 0.15s ease;
	}

	.layer-item:hover {
		background: var(--color-surface1, #45475a);
	}

	.layer-item.hidden {
		opacity: 0.5;
	}

	.layer-item.locked {
		border-left: 2px solid var(--color-yellow, #f9e2af);
	}

	.layer-item.dimmed {
		border-right: 2px solid var(--color-overlay0, #6c7086);
	}

	.layer-info {
		display: flex;
		align-items: center;
		gap: 8px;
		min-width: 0;
		flex: 1;
	}

	.layer-color-indicator {
		width: 12px;
		height: 12px;
		border-radius: 2px;
		flex-shrink: 0;
	}

	.layer-name {
		font-size: 12px;
		font-weight: 500;
		color: var(--color-text, #cdd6f4);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.layer-count {
		font-size: 10px;
		color: var(--color-subtext0, #a6adc8);
		flex-shrink: 0;
	}

	.layer-controls {
		display: flex;
		align-items: center;
		gap: 2px;
		flex-shrink: 0;
	}

	.layer-opacity {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 4px 8px 8px 28px;
		background: var(--color-surface0, #313244);
		border-radius: 0 0 4px 4px;
		margin-top: -2px;
	}

	.opacity-label {
		font-size: 10px;
		color: var(--color-subtext0, #a6adc8);
		white-space: nowrap;
	}

	.layer-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		margin-top: 12px;
		padding-top: 12px;
		border-top: 1px solid var(--color-surface1, #45475a);
	}
</style>
