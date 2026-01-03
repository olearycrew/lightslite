<script lang="ts">
	/**
	 * FormField Component
	 *
	 * A label + input wrapper with consistent styling.
	 * Supports both horizontal and vertical layouts.
	 */

	interface Props {
		label: string;
		id?: string;
		layout?: 'horizontal' | 'vertical';
		hint?: string;
		children: import('svelte').Snippet;
	}

	let { label, id = '', layout = 'horizontal', hint = '', children }: Props = $props();
</script>

<div
	class="form-field"
	class:horizontal={layout === 'horizontal'}
	class:vertical={layout === 'vertical'}
>
	<label class="field-label" for={id || undefined}>
		{label}
		{#if hint}
			<span class="hint">{hint}</span>
		{/if}
	</label>
	<div class="field-input">
		{@render children()}
	</div>
</div>

<style>
	.form-field {
		display: flex;
		gap: 8px;
	}

	.form-field.horizontal {
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
	}

	.form-field.vertical {
		flex-direction: column;
		align-items: stretch;
	}

	.field-label {
		font-size: 12px;
		color: var(--color-text-secondary, #999);
		white-space: nowrap;
		flex-shrink: 0;
	}

	.form-field.horizontal .field-label {
		min-width: 80px;
	}

	.hint {
		display: block;
		font-size: 10px;
		color: var(--color-text-muted, #666);
		font-weight: normal;
	}

	.field-input {
		flex: 1;
		min-width: 0;
	}

	.form-field.horizontal .field-input {
		max-width: 140px;
	}
</style>
