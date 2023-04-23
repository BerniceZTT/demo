FROM earth-demo_base:v1

ARG APP_NAME
ENV APP_NAME=${APP_NAME}

COPY ${APP_NAME}.tar .
RUN tar -xf ${APP_NAME}.tar && cp APP-META/start.sh start.sh && chmod u+x start.sh

COPY APP-META/nginx-config/nginx-proxy.conf /etc/nginx/conf.d/default.conf

ENTRYPOINT [ "./start.sh" ]



