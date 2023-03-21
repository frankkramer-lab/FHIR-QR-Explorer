# FHIR QR Explorer

This web app hosts the backend and React frontend for the graphical visualization for the FHIR QuestionnaireResponse resources.

## Run in production mode
First, update the URL `FHIR_ENDPOINT_PATH` in the `docker-compose.yml` to point to the QuestionnaireResponse Bundle API (HTTP GET).
Run the app in productive mode via Docker-compose:  
```bash
docker-compose build --pull
docker-compose up -d
```
Now check the URL [http://localhost:8083/](http://localhost:8083/).

### To static page
Run the following commands after (temporarily) deploying it via Docker:
```bash
# Copy compiled artifacts
docker cp fhir-qr-explorer:/fhir-qr-explorer/static ./static
# Clone HTML page
curl http://localhost:8083/ | sed 's|static/||g' > ./static/index.html
# Imitate /fhir-query.json endpoint
echo '{"fetch":{"headers":{"Accept":"application/fhir+json"}},"url":"bundle.json"}' > ./static/fhir-query.json

# Run testing HTTP server
cd ./static
python3 -m http.server
```
Now check the URL [http://localhost:8000/](http://localhost:8000/).

## Run in development mode
Run the app in debug mode:
```bash
# run backend
./launch-backend.sh nocors
# run frontend
./launch-frontend.sh
```
Now check the URL [http://localhost:3000/](http://localhost:3000/).
