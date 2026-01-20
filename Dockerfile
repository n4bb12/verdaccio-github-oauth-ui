# See also https://github.com/verdaccio/verdaccio/tree/master/docker-examples/v6

FROM verdaccio/verdaccio:6

USER root

RUN npm install --global verdaccio-github-oauth-ui
ADD verdaccio.yaml /verdaccio/conf/config.yaml

USER $VERDACCIO_USER_UID
