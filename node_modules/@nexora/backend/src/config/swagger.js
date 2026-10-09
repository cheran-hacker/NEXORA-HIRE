import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Nexora Digital Campus API',
      version: '1.0.0',
      description: 'The massive 56-module enterprise API powering the Nexora ecosystem.',
      contact: {
        name: 'Nexora Dev Team'
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Document all routes
  apis: ['./src/routes/*.js'], 
};

let cachedSpec = null;
export const getSwaggerSpec = () => {
  if (!cachedSpec) {
    cachedSpec = swaggerJsdoc(options);
  }
  return cachedSpec;
};
