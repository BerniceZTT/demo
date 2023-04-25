#!/bin/sh

PROG_NAME=$0
ACTION=$1
APP_NAME=earth-demo
CURRENT_DIR=$(cd $(dirname $0);pwd)
DOCKER_CONFIG_DIR="APP-META/docker-config"
FRONTEND_DIR=$CURRENT_DIR/frontend
BACKEND_DIR=$CURRENT_DIR/backend

usege() {
    echo "$CURRENT_DIR"
    echo "Usage: $PROG_NAME {install|clean|build|restart|stop}"
}

install() {
    cd $FRONTEND_DIR
    yarn install
}

buildBase() {
    tag="v1"
    image_name="${APP_NAME}_base"
    docker build -f $DOCKER_CONFIG_DIR/Dockerfile_base -t $image_name:$tag .
}

clean() {
    echo "======clean project begin=========="
    echo "------step1: clean frontend dist---"
    cd $FRONTEND_DIR
    yarn clean
    echo "------step2: clean backend dist----"
    cd $BACKEND_DIR
    ./mvnw clean
    echo "------step3:$APP_NAME.tar------"
    cd $CURRENT_DIR
    rm -rf $APP_NAME.tar
    echo "======clean project end============"
}

build() {
    echo "========build project begin========"
    echo "--------step1: build frontend------"
    cd $FRONTEND_DIR
    yarn build
    let yarn_build_rs=$?
    if [ $yarn_build_rs -ne 0 ]; then
        echo "front build failed."
        echo "=========build project end======="
        return 1;
    else 
        echo "front build success."
    fi 
    echo "--------step2: build backend------"
    cd $BACKEND_DIR
    ./mvnw package -DskipTests
    let mvn_build_rs=$?
    if [ $mvn_build_rs -ne 0 ];then
        echo "backend build failed."
        echo "=========build project end======="
        return 1;
    else
        echo "backend build sucess."
    fi
    echo "-------step3:gen tar file----------"
    cd $CURRENT_DIR
    tar -cf ${APP_NAME}.tar frontend/dist backend/target/${APP_NAME}-backend.jar APP-META/start.sh
    echo "-------step4: build docker image----"
    cd $CURRENT_DIR
    docker build -f $DOCKER_CONFIG_DIR/Dockerfile --build-arg APP_NAME=${APP_NAME} -t $APP_NAME .
    # let docker_build_rs=$?
    
}


stop_container() {
    run_tag=`docker container ls | grep $APP_NAME`
    if [ -z "$run_tag" ]
    then
        echo "container $APP_NAME is not in running"
    else
        echo "stopping container $APP_NAME"
        docker container stop $APP_NAME
        echo "container $APP_NAME has stopped."
    fi
}

restart() {
    stop_container
    docker run -it --rm -d -p 80:80 --name $APP_NAME $APP_NAME
}


main() {
    now=`date "+%Y-%m-%d %H-%M-%S"`
    echo "$now-------------------"
    case "$ACTION" in
        install)
            install
        ;;
        build)
            build
        ;;
        restart)
            restart
        ;;
        clean)
            clean
        ;;
        stop)
            stop_container
        ;;
        buildBase)
            buildBase
        ;;
        *)
            usege
    esac
}

main