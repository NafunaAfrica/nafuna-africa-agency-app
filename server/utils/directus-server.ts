import {
	createDirectus,
	readItem,
	readItems,
	readSingleton,
	rest,
	createItem,
	createUser,
	updateItem,
	staticToken,
	withToken,
} from '@directus/sdk';
import type { Schema } from '~/types/schema';

const directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';

const directusServer = createDirectus<Schema>(directusUrl)
	.with(rest())
	.with(staticToken(process.env.DIRECTUS_SERVER_TOKEN as string));

export { directusServer, readItem, readItems, readSingleton, createItem, createUser, updateItem, withToken };
