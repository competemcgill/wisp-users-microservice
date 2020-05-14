const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    swaggerDefinition: {
        info: {
            title: 'WISP Users Microservice',
            version: '0.0',
            description: 'WISP Users, Authorization, and Authentication API',
        },
        basePath: "/"
    },
    apis: ['src/routes/*.ts'],
};

const specs = swaggerJsdoc(options);

module.exports = (app) => {
    app.use('/users/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
    app.get('/users/swagger.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(specs);
    });
}