## Project: REST API with Node.js, MongoDB, Mongoose, JWT and Swagger

This project is a REST API built with the following technologies:

- **Node.js:** Server-side JavaScript runtime environment.
- **MongoDB:** NoSQL database for storing data.
- **Mongoose:** Object Data Mapping (ODM) library for MongoDB in Node.js.
- **JWT (JSON Web Token):** Authentication mechanism for securing API endpoints.
- **Swagger:** Open-source API documentation tool.

## Features

- Fully functional REST API with basic CRUD operations (Create, Read, Update, Delete).
- Secure authentication using JWT.
- Data persistence with MongoDB.
- Integration tests with Jest.
- Dockerized for easy deployment.
- Swagger documentation for clear API understanding.

## Getting Started

### Prerequisites

- Node.js v16 or higher
- MongoDB
- Docker

### Installation

1. Clone the repository:

```
git clone https://github.com/your-username/your-project-name.git
```

2. Install dependencies:

```
npm install
```

3. Create a `.env` file and fill in the following details:

```
PORT=3000
MONGODB_URI=mongo instance url
ACCESS_JWT_SECRET=secretexample
REFRESH_JWT_SECRET=secretexample

FROM_EMAIL=email-to-use
EMAIL_PASS=password-given-from-google-gmail
```

### Running the API

1. Start the API server:

```
npm run dev
```

2. The API will be running on port 3000 (as specified in the `.env` file).

### Testing

1. Run the Integration tests:

```
npm test
```

## Docker

This project is Dockerized for easy deployment using Docker Compose. To start the application, follow these steps:

**1. Build and run the project:**

Run the following command from the project root directory:

```
docker-compose up
```

This command will:

- Build Docker images for the API and MongoDB services if they don't already exist.
- Start the containers for both services.
- Expose the API on port 3000.

**2. Access the API:**

Once the containers are started, you can access the API at http://localhost:3000.

**3. Stop the application:**

To stop the application, run the following command:

```
docker-compose down
```

This will stop and remove all running containers and networks associated with the project.

## Swagger Documentation

This project includes Swagger documentation for easy API understanding. You can access the documentation at:

http://localhost:3000/v1/docs

## Contributing

We're always looking for ways to improve this project. If you spot any errors, inconsistencies, or missed practices, please contribute! Fork the repository, submit a pull request, and follow our contribution guidelines for a smooth process. We appreciate your commitment to making this project the best it can be.


