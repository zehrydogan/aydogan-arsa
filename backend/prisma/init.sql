-- Enable PostGIS extension for geographic operations
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Create indexes for better performance
-- These will be created by Prisma migrations, but we ensure PostGIS is available