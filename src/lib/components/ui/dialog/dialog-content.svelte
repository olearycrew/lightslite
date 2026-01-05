<script lang="ts">
	import { X } from 'lucide-svelte';
	import {
		type DialogProps,
		type DialogOverlayProps,
		type DialogContentProps,
		dialogHidden,
		dialog,
		dialogOverlay,
		dialogContent,
		dialogPortal,
		type DialogPortalProps
	} from 'bits-ui';
	import { fade, scale } from 'svelte/transition';
	import { type Snippet } from 'svelte';

	let {
		children,
		open = $bindable(false),
		onOpenChange,
		portalProps,
		overlayProps,
		contentProps,
		...restProps
	}: DialogProps & {
		children: Snippet;
		portalProps?: DialogPortalProps;
		overlayProps?: DialogOverlayProps;
		contentProps?: DialogContentProps;
	} = $props();

	const Dialog = dialog.Root;
	const DialogTrigger = dialog.Trigger;
	const DialogPortal = dialog.Portal;
	const DialogOverlay = dialog.Overlay;
	const DialogContent = dialog.Content;
	const DialogTitle = dialog.Title;
	const DialogDescription = dialog.Description;
	const DialogClose = dialog.Close;
</script>

<Dialog bind:open bind:onOpenChange>
	<DialogTrigger>
		<slot name="trigger" />
	</DialogTrigger>

	<DialogPortal>
		<DialogOverlay {overlayProps} transition={fade} transitionConfig={{ duration: 150 }} />
		<DialogContent
			{contentProps}
			transition={scale}
			transitionConfig={{ start: 0.95, duration: 150 }}
			class="fixed left=[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg"
		>
			{@render children()}

			<DialogClose
				class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
			>
				<X class="h-4 w-4" />
				<span class="sr-only">Close</span>
			</DialogClose>
		</DialogContent>
	</DialogPortal>
</Dialog>
