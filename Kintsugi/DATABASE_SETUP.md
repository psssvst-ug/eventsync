# Database Setup Instructions

## Prerequisites
- PostgreSQL database running
- Database connection string in `.env` file

## Running the Migration

The organization and pricing features require new database tables. Follow these steps:

### Option 1: Using psql (Recommended)

1. Make sure your `.env` file has the correct `DATABASE_URL`:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/eventsync"
   ```

2. Run the migration script:
   ```bash
   cd Kintsugi/eventsync-web/eventsync
   psql $DATABASE_URL < migrations/001_add_organizations.sql
   ```

   Or if you need to specify the connection manually:
   ```bash
   psql -h localhost -U username -d eventsync -f migrations/001_add_organizations.sql
   ```

### Option 2: Using Drizzle Kit

If you prefer using Drizzle Kit for migrations:

```bash
cd Kintsugi/eventsync-web/eventsync
npx drizzle-kit push:pg
```

This will sync the schema defined in `db/schema/schema.ts` with your database.

## Verify the Migration

After running the migration, verify that the tables were created:

```sql
-- Check if tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
AND tablename IN ('pricing_plan', 'organization', 'organization_member', 'subscription');
```

You should see 4 tables listed.

## Check Pricing Plans

The migration automatically seeds 4 default pricing plans. Verify they exist:

```sql
SELECT name, display_name, price FROM pricing_plan ORDER BY sort_order;
```

You should see:
- Free ($0)
- Starter ($29)
- Professional ($99)
- Enterprise ($299)

## Troubleshooting

### Error: relation "pricing_plan" does not exist

This means the migration hasn't been run yet. Follow the steps above.

### Error: permission denied

Make sure your database user has permission to create tables:

```sql
GRANT ALL PRIVILEGES ON DATABASE eventsync TO your_username;
```

### Tables exist but no pricing plans

Run the seed script manually:

```bash
cd Kintsugi/eventsync-web/eventsync
npx ts-node scripts/seed-pricing-plans.ts
```

## Next Steps

After the migration is complete:

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Visit http://localhost:3000/pricing to see the pricing plans

3. Create an organization at http://localhost:3000/organizations/create

## Notes

- The migration is idempotent - it won't create duplicate tables if run multiple times
- Existing events will need to be linked to organizations manually
- The free trial period is 14 days for all new organizations
