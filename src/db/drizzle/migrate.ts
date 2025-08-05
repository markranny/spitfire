import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const migration = async () => {
  const sql : any = postgres('...', { max: 1 });
  const db = drizzle(sql);
  await migrate( db, { migrationsFolder: 'src/db/drizzle/migrations' });
  await sql.end();
};

migration();
