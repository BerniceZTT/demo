#!/bin/sh

PROG_NAME=$0
ACTION=$1
CONTAINER_NAME=cesuim_web

usege() {
    echo "Usage: $PROG_NAME {install|clean|build|restart|stop}"
}

install() {
    yarn install
}

clean() {
    yarn clean
}

build() {
    echo "======yarn build======="
    yarn build
    echo "======docker build======="
    docker build -t cesuim_demo .
}


stop_container() {
    run_tag=`docker container ls | grep $CONTAINER_NAME`
    if [ -z "$run_tag" ]
    then
        echo "container $CONTAINER_NAME is not in running"
    else
        echo "stopping container $CONTAINER_NAME"
        docker container stop $CONTAINER_NAME
        echo "container $CONTAINER_NAME has stopped."
    fi
}

restart() {
    stop_container
    docker run -it --rm -d -p 80:80 --name $CONTAINER_NAME cesuim_demo
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
        *)
            usege
    esac
}

main
