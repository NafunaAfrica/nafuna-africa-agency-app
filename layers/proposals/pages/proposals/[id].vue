<script setup lang="ts">
import type { OsProposal } from '~/types';

definePageMeta({
	layout: 'proposal',
});

const { params, path } = useRoute();

const {
	data: proposal,
	pending,
	error,
} = await useAsyncData(path, async () => {
	try {
		// Debug environment variables
		console.log('Environment check:', {
			DIRECTUS_URL: process.env.DIRECTUS_URL,
			DIRECTUS_SERVER_TOKEN: process.env.DIRECTUS_SERVER_TOKEN ? 'Present' : 'Missing',
			token_length: process.env.DIRECTUS_SERVER_TOKEN?.length
		});
		
		console.log('Fetching proposal with ID:', params.id);
		
		// Test basic Directus connection first
		console.log('Testing basic Directus connection...');
		try {
			const testConnection = await useDirectus(
				$fetch('/server/health')
			);
			console.log('Directus connection test:', testConnection);
		} catch (connErr) {
			console.error('Directus connection failed:', connErr);
		}
		
		// Simplified query to test basic access first
		console.log('Testing simplified proposal query...');
		const result = await useDirectus(
			readItem('os_proposals', params.id as string, {
				fields: ['id', 'name', 'status']
			})
		);
		
		// If basic query works, try with minimal relations
		if (result) {
			console.log('Basic query successful, trying with relations...');
			const fullResult = await useDirectus(
				readItem('os_proposals', params.id as string, {
					fields: [
						'name',
						{ organization: ['name'] },
						{ owner: ['first_name', 'last_name'] }
						// Removed complex blocks temporarily
					]
				})
			);
			return fullResult;
		}
		console.log('Directus query result:', result);
		return result;
	} catch (err) {
		console.error('Directus query failed:', err);
		throw err;
	}
});

if (!proposal.value) {
	// Enhanced debugging for existing data
	console.error('Proposal query returned null/undefined:', {
		id: params.id,
		path,
		proposalValue: proposal.value,
		errorValue: error.value,
		pendingValue: pending.value
	});
	
	// Let's try a simpler query to test connection
	try {
		console.log('Testing basic Directus connection...');
		const testQuery = await useDirectus(
			readItems('os_proposals', {
				fields: ['id', 'name'],
				limit: 5
			})
		);
		console.log('Available proposals:', testQuery);
		
		// Try to find our specific proposal
		const specificProposal = testQuery?.find((p: any) => p.id === params.id);
		if (specificProposal) {
			console.log('Found proposal in list but detailed query failed:', specificProposal);
		} else {
			console.log('Proposal ID not found in available proposals');
		}
	} catch (testError) {
		console.error('Basic Directus connection test failed:', testError);
	}
	
	throw createError({ 
		statusCode: 404, 
		statusMessage: `Proposal '${params.id}' not found. Check console for debugging info.` 
	});
}
</script>
<template>
	<div class="">
		<ProposalsHeader
			:title="proposal?.name"
			class="fixed top-0 z-20 flex justify-center w-full p-2"
			:name="proposal?.name"
			:organization="proposal?.organization?.name"
		/>
		<div class="overflow-y-auto">
			<ProposalsBlocksHero
				class="pt-36"
				:name="proposal?.name"
				:owner="proposal?.owner"
				:organization="proposal?.organization?.name"
			/>
			<!-- Render the page using the PageBuilder component -->
			<PageBuilder v-if="proposal" id="content" :page="proposal as OsProposal" />
			<ProposalsBlocksAcceptance id="accept" class="max-w-3xl mx-auto" />
		</div>
	</div>
</template>
