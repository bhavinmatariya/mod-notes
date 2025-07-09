# mod-notes

A modular Fastify plugin for notes management with MongoDB integration.

## Features

- Clean Fastify plugin architecture
- MongoDB integration with Mongoose
- Complete CRUD operations for notes
- Text search capabilities
- Pagination support
- Swagger/OpenAPI documentation
- Comprehensive testing

## Installation

```bash
npm install mod-notes
```

## Usage

### Basic Usage

```javascript
const fastify = require('fastify')();
const notesPlugin = require('mod-notes');

// Register the plugin
fastify.register(notesPlugin, {
  mongoUri: 'mongodb://localhost:27017/your-database',
  prefix: '/api' // Optional prefix for all routes
});

// Start your server
fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log('Server running on port 3000');
});
```

### Configuration Options

The plugin accepts the following options:

- `mongoUri`: MongoDB connection string (required if not set in environment variables)
- `host`: Host for Swagger documentation (default: 'localhost')
- `port`: Port for Swagger documentation (default: 3000)
- `prefix`: Route prefix for all endpoints (default: none)

## Environment Variables

Create a `.env` file in your project root with the following variables:

```
MONGODB_URI=mongodb://localhost:27017/your-database
PORT=3000
HOST=localhost
NODE_ENV=development
```

## API Endpoints

### Create a Note

**POST** `/notes`

Request body:
```json
{
  "title": "Note Title",
  "body": "Note content goes here"
}
```

Response (201 Created):
```json
{
  "_id": "60d21b4667d0d8992e610c85",
  "title": "Note Title",
  "body": "Note content goes here",
  "createdAt": "2023-10-20T15:00:00.000Z",
  "updatedAt": "2023-10-20T15:00:00.000Z"
}
```

### Get All Notes

**GET** `/notes?page=1&limit=10`

Response (200 OK):
```json
{
  "data": [
    {
      "_id": "60d21b4667d0d8992e610c85",
      "title": "Note Title",
      "body": "Note content goes here",
      "createdAt": "2023-10-20T15:00:00.000Z",
      "updatedAt": "2023-10-20T15:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

### Get Note by ID

**GET** `/notes/:id`

Response (200 OK):
```json
{
  "_id": "60d21b4667d0d8992e610c85",
  "title": "Note Title",
  "body": "Note content goes here",
  "createdAt": "2023-10-20T15:00:00.000Z",
  "updatedAt": "2023-10-20T15:00:00.000Z"
}
```

### Search Notes

**GET** `/notes/search?q=keyword`

Response (200 OK):
```json
[
  {
    "_id": "60d21b4667d0d8992e610c85",
    "title": "Note with keyword",
    "body": "Content with keyword",
    "createdAt": "2023-10-20T15:00:00.000Z",
    "updatedAt": "2023-10-20T15:00:00.000Z"
  }
]
```

### Vector Search Notes (Semantic Search)

**GET** `/notes/vector-search?q=keyword&limit=5`

Response (200 OK):
```json
[
  {
    "_id": "60d21b4667d0d8992e610c85",
    "title": "Note with semantically similar content",
    "body": "Content that is conceptually related to the query",
    "createdAt": "2023-10-20T15:00:00.000Z",
    "updatedAt": "2023-10-20T15:00:00.000Z",
    "_similarity": 0.87
  }
]
```

## Documentation

API documentation is available at `/documentation` when the server is running.

## Development

### Prerequisites

- Node.js 14+
- MongoDB 4+

### Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example`
4. Start the development server: `npm run dev`

### Testing

Run all tests:
```bash
npm test
```

Run unit tests:
```bash
npm run test:unit
```

Run integration tests:
```bash
npm run test:integration
```