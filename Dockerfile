FROM verdaccio/verdaccio

USER root

RUN yarn add verdaccio-google-oauth-ui@5
COPY verdaccio.yaml /verdaccio/conf/config.yaml

USER verdaccio
