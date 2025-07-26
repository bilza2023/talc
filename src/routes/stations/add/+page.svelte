<script>
	import { enhance } from '$app/forms';
  
	/** @type {import('./$types').ActionData} */
	export let form;
  
	let message = '';
	$: message =
	  form?.error
		? `❌ ${form.error}`
		: form?.success
		? '✅ Station added successfully!'
		: '';
  </script>
  
  <style>
	:global(body) {
	  background: #121212;
	  color: #eee;
	  font-family: system-ui, sans-serif;
	}
  
	h1 { text-align: center; margin-top: 2rem; font-size: 1.5rem; }
  
	form {
	  max-width: 420px;
	  margin: 1.5rem auto;
	  padding: 2rem;
	  background: #1e1e1e;
	  border-radius: 8px;
	  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
	  display: grid;
	  gap: 1.2rem;
	}
  
	label {
	  display: flex;
	  flex-direction: column;
	  font-size: 0.9rem;
	  color: #ccc;
	}
  
	input {
	  padding: 0.6rem 0.8rem;
	  background: #2a2a2a;
	  border: 1px solid #444;
	  border-radius: 4px;
	  color: #eee;
	  font-size: 1rem;
	}
  
	input:focus {
	  outline: none;
	  border-color: #3ea6ff;
	  box-shadow: 0 0 0 2px rgba(62,166,255,0.4);
	}
  
	button {
	  padding: 0.7rem;
	  background: #3ea6ff;
	  color: #0f0f0f;
	  font-weight: 600;
	  border: none;
	  border-radius: 4px;
	  cursor: pointer;
	  transition: background 0.2s ease;
	}
  
	button:hover { background: #58b4ff; }
	button:active { background: #2a8fe0; }
  
	p { text-align: center; margin-top: 1rem; font-size: 0.95rem; font-weight: 500; color: #f0c979; }
  </style>
  
  <h1>Add Station</h1>
  
  <form method="POST" use:enhance>
	<label>
	  Name
	  <input name="name" required />
	</label>
  
	<button type="submit">Save</button>
  </form>
  
  {#if message}
	<p>{message}</p>
  {/if}
  