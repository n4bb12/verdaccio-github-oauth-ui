# See also https://github.com/verdaccio/verdaccio/tree/master/docker-examples/v7

FROM verdaccio/verdaccio:7

USER root

RUN npm install --global verdaccio-github-oauth-ui
ADD verdaccio.yaml /verdaccio/conf/config.yaml

USER $VERDACCIO_USER_UID
