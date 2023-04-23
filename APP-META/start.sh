#!/bin/sh

# 启动JAVA
JAR_FILE="backend/target/${APP_NAME}-backend.jar"
JAVA_OPTS="-server -Xms1536m -Xmx1536m -Xmn768m"
JAVA_OPTS="${JAVA_OPTS} -Dserver.port=7001 -Dmanagement.port=7002 -Dmanagement.server.port=7002"
nohup java ${JAVA_OPTS} -jar ${JAR_FILE} > application.log &

# 启动nginx
nginx -g "daemon off;"