// Increase the timeout for all tests
jest.setTimeout(60000);

// Increase Mongoose's operation timeout
process.env.MONGODB_OPERATION_TIMEOUT = 30000; 