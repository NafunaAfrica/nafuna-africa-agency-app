<script setup lang="ts">
import type { OsProposal } from '~/types';

definePageMeta({
	layout: 'proposal',
});

const { params } = useRoute();

const {
	data: proposal,
	pending,
	error,
} = await useAsyncData(`proposal-${params.id}`, async () => {
	try {
		console.log('Fetching proposal:', params.id);
		
		// Try basic fields first
		const basicResult = await useDirectus(
			readItem('os_proposals', params.id as string, {
				fields: ['id', 'name', 'status', 'organization', 'owner']
			})
		);
		
		console.log('Basic proposal data:', basicResult);
		
		// If basic works, try with relations
		if (basicResult) {
			try {
				const fullResult = await useDirectus(
					readItem('os_proposals', params.id as string, {
						fields: [
							'*',
							'organization.name',
							'owner.first_name',
							'owner.last_name'
						]
					})
				);
				console.log('Full proposal data:', fullResult);
				return fullResult;
			} catch (relationErr) {
				console.log('Relations failed, using basic data:', relationErr);
				return basicResult;
			}
		}
		
		return basicResult;
	} catch (err) {
		console.error('Proposal fetch failed:', err);
		throw err;
	}
});

if (error.value) {
	throw createError({ 
		statusCode: 404, 
		statusMessage: `Proposal not found` 
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
