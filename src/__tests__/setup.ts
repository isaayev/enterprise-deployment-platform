// Setup environment variables for test execution
(process.env as Record<string, string>).NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-that-is-at-least-32-characters-long-for-testing';
process.env.ADMIN_EMAIL = 'admin@enterprise.gg';
process.env.ADMIN_USERNAME = 'NexusAdmin';
process.env.ADMIN_PASSWORD = 'TestAdminPassword123!';
