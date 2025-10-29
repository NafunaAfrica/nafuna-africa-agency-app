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
		console.log('Fetching proposal with ID:', params.id);
		const result = await useDirectus(
			readItem('os_proposals', params.id as string, {
				fields: [
				'name',
				{
					organization: ['name', 'logo', 'brand_color'],
					owner: ['first_name', 'last_name', 'avatar', 'title'],
					blocks: [
						'collection',
						{
							item: {
								block_hero: ['id', 'title', 'headline', 'content', 'image', 'buttons', 'image_position'],
								block_faqs: ['id', 'title', 'faqs', 'headline', 'alignment'],
								block_richtext: ['id', 'title', 'headline', 'content', 'alignment'],
								block_testimonials: [
									'id',
									'title',
									'headline',
									{
										testimonials: [
											{
												testimonials_id: [
													'id',
													'title',
													'subtitle',
													'content',
													'company',
													'company_logo',
													{ image: ['id', 'title', 'description'] },
												],
											},
										],
									},
								],
								block_quote: ['id', 'title', 'subtitle', 'content'],
								block_cta: ['id', 'title', 'headline', 'content', 'buttons'],
								block_form: ['id', 'title', 'headline', { form: ['*'] }],
								block_logocloud: ['id', 'title', 'headline', { logos: ['*'] }],
								block_gallery: [
									'id',
									'title',
									'headline',
									{
										gallery_items: [
											{
												directus_files_id: ['id', 'title', 'description'],
											},
										],
									},
								],
								block_steps: [
									'id',
									'title',
									'headline',
									'show_step_numbers',
									'alternate_image_position',
									{
										steps: ['id', 'title', 'content', 'image'],
									},
								],
								block_columns: [
									'id',
									'title',
									'headline',
									{
										rows: ['title', 'headline', 'content', 'image_position', { image: ['id', 'title', 'description'] }],
									},
								],
								block_divider: ['id', 'title'],
								block_team: ['*'],
								block_html: ['*'],
								block_video: ['*'],
								block_cardgroup: ['*'],
							},
						},
					],
				},
			],
			})
		);
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
