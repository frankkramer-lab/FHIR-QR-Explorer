# FHIR QR Explorer

This  repository hosts the code for the AMIA2023 paper submission `Web-based Prototype for Graphical Exploration of FHIR Questionnaire Responses`.\
The **FHIR QR Explorer** is a client-side prototype of a web application for exploring FHIR QuestionnaireResponse datasets. It allows the interactive visualization of question-answer statistics.

A [demo page](https://frankkramer-lab.github.io/FHIR-QR-Explorer/) is available.

**Accepted at AMIA 2023! See you in New Orleans!**

## How to run in "production" mode
First, update the URL `FHIR_ENDPOINT_PATH` in the `docker-compose.yml` to point to the QuestionnaireResponse Bundle API (HTTP GET).
Run the app in productive mode via Docker-compose:  
```bash
docker-compose build --pull
docker-compose up -d
```
Now check the URL [http://localhost:8083/](http://localhost:8083/).

## How to run in development mode
Run the app in developemnt mode:
```bash
# generate bundle.json data
python3 ./generateBundle.py
# run backend
./launch-backend.sh nocors
# run frontend
./launch-frontend.sh
```
Now check the URL [http://localhost:3000/](http://localhost:3000/).
