<script>
	import { enhance } from '$app/forms';

	/** @type {import('./$types').ActionData} */
	export let form;

	let message = '';
	$: message =
		form?.error
			? `❌ ${form.error}`
			: form?.success
			? '✅ Supplier added successfully!'
			: '';
</script>

<style>
	:global(body) {
		background-color: #121212;
		color: #eee;
		font-family: system-ui, sans-serif;
	}

	h1 {
		text-align: center;
		margin-top: 2rem;
		font-size: 1.6rem;
		color: #f0f0f0;
	}

	form {
		max-width: 440px;
		margin: 2rem auto;
		padding: 2rem;
		background: #1c1c1c;
		border-radius: 10px;
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5);
		display: grid;
		gap: 1.5rem;
	}

	label {
		display: flex;
		flex-direction: column;
		font-size: 0.95rem;
		color: #ccc;
	}

	input {
		padding: 0.6rem 0.75rem;
		background: #2b2b2b;
		border: 1px solid #444;
		border-radius: 5px;
		color: #f0f0f0;
		font-size: 1rem;
	}

	input:focus {
		outline: none;
		border-color: #3ea6ff;
		box-shadow: 0 0 0 2px rgba(62, 166, 255, 0.4);
	}

	button {
		padding: 0.7rem;
		background: #3ea6ff;
		color: #0f0f0f;
		font-weight: 600;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		transition: background 0.2s ease;
	}

	button:hover {
		background: #58b4ff;
	}

	button:active {
		background: #2a8fe0;
	}

	p {
		text-align: center;
		margin-top: 1rem;
		font-size: 0.95rem;
		font-weight: 500;
		color: #f8d179;
	}
</style>

<h1>Add Supplier</h1>

<form method="POST" use:enhance>
	<label>
		Name
		<input name="name" required />
	</label>

	<label>
		Code (unique)
		<input name="code" required />
	</label>

	<button type="submit">Save</button>
</form>

{#if message}
	<p>{message}</p>
{/if}
