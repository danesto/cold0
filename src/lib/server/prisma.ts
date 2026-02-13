// place files you want to import through the `$lib` alias in this folder.
import { PrismaClient } from '../../generated/client';
import { DATABASE_URL } from '$env/static/private';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
	connectionString: DATABASE_URL
});

const prisma = new PrismaClient({
	adapter
});

export default prisma;
