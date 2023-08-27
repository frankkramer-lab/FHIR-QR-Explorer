FROM node:16-alpine AS react_build

WORKDIR /app
COPY ./src-frontend /app
RUN npm install
RUN npm run build

FROM python:3.10 as bundle_sampling
COPY . /fhir
RUN python3 /fhir/generateBundle.py

FROM python:3.10 as layered_build

COPY src-backend/ /fhir-qr-explorer
WORKDIR /fhir-qr-explorer

# Import generated static bundle.json
COPY --from=bundle_sampling /fhir/src-backend/static/bundle.json /fhir-qr-explorer/static/bundle.json

RUN python3 -m pip install setuptools wheel
RUN python3 -m pip install -r requirements.txt
RUN /fhir-qr-explorer/downloadResources.sh

COPY --from=react_build /app/dist /dist
RUN cp /dist/app.js static/ && \
    cp /dist/app.js.LICENSE.txt static/ && \
    cp /dist/*.wasm static/ && \
    rm -rf /dist

FROM scratch
COPY --from=layered_build / /
CMD ["gunicorn", "-w", "2", "-b", "0.0.0.0:80", "--chdir", "/fhir-qr-explorer", "wsgi:app"]