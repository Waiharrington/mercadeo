-- Permisos para el schema mercadeo
GRANT USAGE ON SCHEMA mercadeo TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA mercadeo TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA mercadeo TO anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA mercadeo TO anon, authenticated, service_role;

-- Permisos para tablas futuras
ALTER DEFAULT PRIVILEGES IN SCHEMA mercadeo GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA mercadeo GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA mercadeo GRANT EXECUTE ON FUNCTIONS TO anon, authenticated, service_role;
