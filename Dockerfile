FROM verdaccio/verdaccio

USER root

RUN yarn add verdaccio-github-oauth-ui
COPY verdaccio.yaml /verdaccio/conf/config.yaml

USER verdaccio
