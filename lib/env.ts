export function validateEnvironment() {
  const dbUrl = process.env.DATABASE_URL || '';
  const appEnv = process.env.APP_ENV || 'development';

  // Production IPs that should NOT be connected to from a development environment
  // Add any other production IPs or hostnames here
  const productionHosts = [
    '172.17.1.242',
    // 'production-database-hostname.com'
  ];

  const isConnectingToProduction = productionHosts.some(host => dbUrl.includes(host));

  if (isConnectingToProduction && appEnv !== 'production') {
    throw new Error(
      `\n\n` +
      `========================================================================\n` +
      `🚨 CRITICAL SECURITY ERROR 🚨\n` +
      `========================================================================\n` +
      `You are attempting to connect to a PRODUCTION database (${dbUrl.split('@')[1] || dbUrl}) \n` +
      `while APP_ENV is set to '${appEnv}'.\n\n` +
      `If you really intend to run this in production, you must set:\n` +
      `APP_ENV="production"\n` +
      `in your .env file.\n\n` +
      `This safeguard prevents accidental data corruption in the legacy database.\n` +
      `========================================================================\n\n`
    );
  }

  return true;
}
