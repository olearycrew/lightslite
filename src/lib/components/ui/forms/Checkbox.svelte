<script lang="ts">
	/**
	 * Checkbox Component
	 *
	 * Styled checkbox with label.
	 */

	interface Props {
		checked: boolean;
		label?: string;
		id?: string;
		disabled?: boolean;
		onchange?: (checked: boolean) => void;
	}

	let { checked = $bindable(), label = '', id = '', disabled = false, onchange }: Props = $props();

	function handleChange(event: Event) {
		const input = event.target as HTMLInputElement;
		checked = input.checked;
		onchange?.(input.checked);
	}
</script>

<label class="checkbox-wrapper" class:disabled>
	<input type="checkbox" class="checkbox-input" {id} {checked} {disabled} onchange={handleChange} />
	<span class="checkbox-box">
		{#if checked}
			<svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
				<polyline
					points="20 6 9 17 4 12"
					stroke-width="3"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		{/if}
	</span>
	{#if label}
		<span class="checkbox-label">{label}</span>
	{/if}
</label>

<style>
	.checkbox-wrapper {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		cursor: pointer;
		user-select: none;
	}

	.checkbox-wrapper.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.checkbox-input {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
	}

	.checkbox-box {
		width: 16px;
		height: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-bg-tertiary, #1e1e1e);
		border: 1px solid var(--color-border, #444);
		border-radius: 3px;
		transition: all 0.15s ease;
	}

	.checkbox-input:checked + .checkbox-box {
		background: var(--color-accent, #4287f5);
		border-color: var(--color-accent, #4287f5);
	}

	.checkbox-input:focus + .checkbox-box {
		border-color: var(--color-accent, #4287f5);
		box-shadow: 0 0 0 2px rgba(66, 135, 245, 0.2);
	}

	.check-icon {
		width: 12px;
		height: 12px;
		color: white;
	}

	.checkbox-label {
		font-size: 12px;
		color: var(--color-text-secondary, #999);
	}
</style>
