# LFS Data Core based on Apache Sling

[![Build Status](https://travis-ci.com/ccmbioinfo/lfs.svg?branch=dev)](https://travis-ci.com/ccmbioinfo/lfs)

## Prerequisites:
* Java 1.8+
* Maven 3.3+

## Build:
`mvn clean install`

Additional options include:

`mvn clean -Pclean-node` to remove compiled frontend code

`mvn clean -Pclean-instance` to remove the sling/ folder generated by running Sling

`mvn install -Pquick` to skip many of the test steps

`mvn install -Pskip-webpack` to skip reinstalling webpack/yarn and dependencies and skip regenerating the frontend with webpack

`mvn install -PautoInstallBundle` to inject compiled code into a running instance of Sling at `http://localhost:8080/` with admin:admin.

To specify a different password, use `-Dsling.password=newPassword`

To specify a different URL, use `-Dsling.url=https://lfs.server:8443/system/console` (the URL must end with `/system/console` to work properly)

`mvn install -PintegrationTests` to run integration tests

## Run:
`java -jar distribution/target/lfs-*.jar` => the app will run at `http://localhost:8080` (default port)

`java -jar distribution/target/lfs-*.jar -p PORT` to run at a different port

`java -jar distribution/target/lfs-*.jar -Dsling.run.modes=dev` to include the content browser (Composum), accessible at `http://localhost:8080/bin/browser.html`

## Running with Docker

If Docker is installed, then the build will also create a new image named `lfs/lfs:latest`

Before the LFS Docker container can be started, an isolated network providing MongoDB must be established. To do so:

```bash
docker network create lfsbridge
docker run --rm --network lfsbridge --name mongo -d mongo
```

For basic testing of the LFS Docker image, run:

```bash
docker run --rm --network lfsbridge -e INITIAL_SLING_NODE=true -d -p 8080:8080 lfs/lfs
```

However, since runtime data isn't persisted after the container stops, no changes will be permanently persisted this way.
It is recommended to first create a permanent volume that can be reused between different image instantiations, and different image versions.

`docker volume create --label server=production lfs-production-volume`

Then the container can be started with:

`docker container run --rm --network lfsbridge -e INITIAL_SLING_NODE=true --detach --volume lfs-test-volume:/opt/lfs/sling/ -p 8080:8080 --name lfs-production lfs/lfs`

Explanation:

- `docker container run` creates and starts a new container
- `--rm` will automatically remove the container after it is stopped
- `--network lfsbridge` causes the container to connect to the network providing MongoDB
- `--detach` starts the container in the background
- `-e INITIAL_SLING_NODE=true` marks this container as the first to start up, and thus responsible for setting up the database
- `--volume lfs-test-volume:/opt/lfs/sling/` mounts the volume named `lfs-test-volume` at `/opt/lfs/sling/`, where the application data is stored
- `-p 8080:8080` makes the local port 8080 forward to the 8080 port inside the container
    - you can also specify a specific local network, and a different local port, for example `-p 127.0.0.1:9999:8080`
    - the second port must be `8080`
- `--name lfs-production` gives a name to the container, for easy identification
- `lfs/lfs` is the name of the image

To enable developer mode, also add `--env DEV=true -p 5005:5005` to the `docker run` command.

To enable debug mode, also add `--env DEBUG=true` to the `docker run` command. Note that the application will not start until a debugger is actually attached to the process on port 5005.

`docker run --network lfsbridge -d -p 8080:8080 -p 5005:5005 -e INITIAL_SLING_NODE=true --env DEV=true --env DEBUG=true --name lfs-debug lfs/lfs`

## Running with Docker-Compose

Docker-Compose can be employed to create a cluster of *N* MongoDB Shards, *M* MongoDB Replicas, and *one* LFS instance.

### Installing/Starting

1. Before proceeding, ensure that the `lfs/lfs` Docker image has been built.

```bash
mvn clean install
```

2. The `ccmsk/neuralcr` image is also required. Please build it based on
the instructions available
at [https://github.com/ccmbioinfo/NeuralCR](https://github.com/ccmbioinfo/NeuralCR).
Use the **develop** branch.

Download the pre-trained NCR models from [here](https://github.com/ccmbioinfo/NeuralCR/releases/download/1.0/ncr_model_params.tar.gz)
and un-tar. Create the directory `NCR_MODEL` under `compose-cluster` and copy in the file `pmc_model_new.bin` along
with the directories `0` and `1` from the `ncr_model_params` directory.

3. Now build the *docker-compose* environment.

```bash
cd compose-cluster
python3 generate_compose_yaml.py --shards 2 --replicas 3
docker-compose build
```

4. Start the *docker-compose* environment.

```bash
docker-compose up -d
```

5. The LFS instance should be available at `http://localhost:8080/`

5.1. To inspect the data split between the MongoDB shards:
```bash
docker-compose exec router mongo
sh.status()
exit
```

### Stopping gracefully, without losing data

1. To stop the MongoDB/LFS cluster:

```bash
docker-compose down
```

### Restarting

1. To restart the MongoDB/LFS cluster while preserving the entered data
from the previous execution:

```bash
LFS_RELOAD=true docker-compose up -d
```

### Cleaning up

1. To stop the MongoDB/LFS cluster and **delete all entered data**:

```
docker-compose down #Stop all containers
docker-compose rm #Remove all stopped containers
docker volume prune -f #Remove all stored data
./cleanup.sh #Remove the cluster configuration files
```
