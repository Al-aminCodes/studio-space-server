# StudioSpace Server 🚀

### Backend REST API for StudioSpace

StudioSpace Server is the backend API for the StudioSpace application, a studio and space management platform. It provides RESTful endpoints for studio listings, booking management, category statistics, and user-specific data.

Built with Node.js, Express, and MongoDB, the server integrates with Better Auth's JSON Web Key Set (JWKS) endpoint to verify authentication tokens on protected routes.

🔗 **Backend Repository:** [studio-space-server](https://github.com/Al-aminCodes/studio-space-server)

🌐 **Deployed API:** [StudioSpace Server](https://studio-space-server-kohl.vercel.app/)

💻 **Frontend Repository:** [studio-space-client](https://github.com/Al-aminCodes/studio-space-client)

🖥️ **Live Application:** [StudioSpace](https://studio-space-client-chi.vercel.app/)

---

## ✨ Features

- **RESTful API:** Provides endpoints for studio listings and booking management.
- **Studio Management:** Retrieve all studios, view individual studio details, and create new listings.
- **CRUD Operations:** Supports creating, reading, updating, and deleting studio listings.
- **Booking Management:** Create bookings, retrieve user bookings, and delete booking records.
- **Duplicate Booking Prevention:** Checks for an existing Pending or Confirmed booking for the same studio and user.
- **User-Specific Listings:** Retrieve listings associated with a user's email address.
- **Category Statistics:** Aggregate studio counts by category using MongoDB.
- **Featured Studios:** Retrieve a limited collection of six studios.
- **JWT Verification:** Verify Bearer tokens using Better Auth's remote JWKS endpoint.
- **MongoDB Integration:** Store and retrieve studio and booking information.
- **Environment Configuration:** Use environment variables for database connections and authentication configuration.
- **CORS Support:** Enable cross-origin requests for frontend integration.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js 5 | REST API and routing |
| MongoDB | Database |
| MongoDB Node.js Driver | Database queries and CRUD operations |
| Better Auth | Authentication integration |
| jose | JWT verification and remote JWKS support |
| dotenv | Environment variable configuration |
| cors | Cross-origin resource sharing |
| nodemon | Development server monitoring |

---

## 🔌 API Endpoints

Base URL for local development:

```text
http://localhost:8000
```

### Studio Endpoints

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| `GET` | `/` | Check server status | Public |
| `GET` | `/studios` | Retrieve all studios | Public |
| `GET` | `/studios/:id` | Retrieve a studio by ID | Required |
| `GET` | `/studios-limit` | Retrieve up to six studios | Public |
| `GET` | `/studios/categories/count` | Get studio counts grouped by category | Public |
| `POST` | `/add-studios` | Create a studio listing | Required |

### User Listing Endpoints

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| `GET` | `/my-listings/:email` | Retrieve listings by user email | Required |
| `PATCH` | `/my-listings/:id` | Update an existing listing | Required |
| `DELETE` | `/my-listings/:id` | Delete a listing | Required |

### Booking Endpoints

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| `POST` | `/bookings-studios` | Create a booking | Required |
| `GET` | `/my-bookings/:email` | Retrieve bookings by user email | Required |
| `DELETE` | `/bookings-studios/:id` | Delete a booking | Required |

**Authentication:** Protected endpoints expect a valid Bearer token in the HTTP `Authorization` header.

```http
Authorization: Bearer YOUR_AUTH_TOKEN
```

---

## 🔄 CRUD Operations

StudioSpace Server supports the following data-management operations.

### Create

Create a studio listing using:

```http
POST /add-studios
Authorization: Bearer YOUR_AUTH_TOKEN
Content-Type: application/json
```

The request body contains the studio information to insert into MongoDB.

### Read

Retrieve all studio listings:

```http
GET /studios
```

Retrieve one studio:

```http
GET /studios/:id
```

Retrieve a user's listings:

```http
GET /my-listings/:email
Authorization: Bearer YOUR_AUTH_TOKEN
```

### Update

Update an existing listing using:

```http
PATCH /my-listings/:id
Authorization: Bearer YOUR_AUTH_TOKEN
Content-Type: application/json
```

Supported update fields:

- `title`
- `category`
- `hourlyRate`
- `securityDeposit`
- `maxCapacity`
- `location`
- `imageUrl`
- `amenities`
- `overview`

The server only includes these allowed fields in the update operation.

### Delete

Delete a listing using:

```http
DELETE /my-listings/:id
Authorization: Bearer YOUR_AUTH_TOKEN
```

Delete a booking using:

```http
DELETE /bookings-studios/:id
Authorization: Bearer YOUR_AUTH_TOKEN
```

The server returns a success or error response depending on the outcome of the operation.

---

## 📅 Booking Management

The booking API supports creating bookings and retrieving a user's booking history.

### Create a booking

```http
POST /bookings-studios
Authorization: Bearer YOUR_AUTH_TOKEN
Content-Type: application/json
```

The booking request requires:

- `studioId`
- `studioTitle`
- `userEmail`

The server normalizes the email address, checks for an existing Pending or Confirmed booking for the same studio and email, and creates a new booking with a Pending status when the check passes.

Successful creation returns HTTP `201 Created`. An existing active booking returns HTTP `409 Conflict`.

### Retrieve bookings

```http
GET /my-bookings/:email
Authorization: Bearer YOUR_AUTH_TOKEN
```

The response contains a success indicator and the matching booking records.

### Delete a booking

```http
DELETE /bookings-studios/:id
Authorization: Bearer YOUR_AUTH_TOKEN
```

The server validates the MongoDB ObjectId and returns an appropriate response when the booking is deleted or not found.

---

## 🔐 Authentication & Security

The backend uses the `jose` package to verify JWTs with a remote JWKS endpoint provided by the authentication application.

The authentication middleware:

1. Reads the `Authorization` header.
2. Requires the `Bearer` token format.
3. Verifies the token using the configured remote JWKS.
4. Extracts the email claim into `req.user` after successful verification.
5. Rejects missing, invalid, or expired tokens with HTTP `401 Unauthorized`.

### Security considerations

Token verification authenticates the caller, but it does not automatically prove that the caller owns a particular listing or booking.

For production use, update and delete operations should also check ownership in the database query. User-specific routes should derive the identity from the verified token rather than trusting an arbitrary email supplied in the URL or request body.

---

## 🗄️ Database Structure

The server uses the `studio-space` MongoDB database and the following collections:

| Collection | Purpose |
|---|---|
| `stideos-data` | Studio listings and associated information |
| `booking-studios` | Studio booking records |

The MongoDB driver is used for inserting, retrieving, updating, deleting, and aggregating records.

---

## 🌐 Deployment

The backend is deployed at:

[https://studio-space-server-kohl.vercel.app/](https://studio-space-server-kohl.vercel.app/)

When deploying your own instance:

1. Import the repository into your hosting platform.
2. Configure `MONGODB_URL` and `CLIENT_URL`.
3. Make sure the configured MongoDB database is accessible.
4. Ensure the frontend authentication application exposes the expected JWKS endpoint.
5. Test public and protected API routes after deployment.
6. Verify booking creation, duplicate prevention, listing management, and database connectivity.

For more information, see the [Express documentation](https://expressjs.com/) and [MongoDB Node.js driver documentation](https://www.mongodb.com/docs/drivers/node/current/).

---

## 👨‍💻 Author

**Al Amin**

- GitHub: [@Al-aminCodes](https://github.com/Al-aminCodes)
- Frontend: [StudioSpace Client](https://github.com/Al-aminCodes/studio-space-client)
- Backend: [StudioSpace Server](https://github.com/Al-aminCodes/studio-space-server)

---

## ⭐ Support

If you find this project useful, consider giving the repository a star on GitHub.

**Built with ❤️ by Al Amin using Node.js, Express, and MongoDB.**
