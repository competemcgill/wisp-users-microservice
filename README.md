# WISP Users Microservice

## Running Server:

For development:
* `npm install`
* `npm run dev`

## Viewing OpenAPI spec:

```bash
docker pull swaggerapi/swagger-editor
docker run -d -p 8000:8080 swaggerapi/swagger-editor
```

Then open [`localhost:8000`](http://localhost:8000) and click `File > Import File` and navigate to your local clone of the repository.