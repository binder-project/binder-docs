# custom deployments

If your needs extend beyond the public cluster — maybe you want to use private data, or need to guarantee a certain number of slots — you might be interested in a custom deployment.

We've tried to make it as simple as possible to launch Binder deployments using either your own infrastructure or a cloud provider. The only requirements are node.js, Docker, and a Kubernetes cluster, and we provide a command line-tool `binder-control` to make configuration easy.

The public Binder cluster is running on Google Compute Engine (GCE), and this is currently the most stable and well-tested deployment setting. You can launch a single machine on GCE to run all the Binder services and servers, and we have packaged all Binder components into Docker images, so that you can do all launching and configuration with the `binder-control` command-line tool. This guide will walk through that approach.

However, the system can also adapt to your environment. If you want to use your own Kubernetes cluster, Binder can integrate with it entirely through the Kubernetes HTTP API, so it does not require SSH access to the cluster nodes. And each Binder server is designed to run independently, with the configuration files in `~/.binder` enabling a variety of different deployment types. 

## launching a server

The simplest approach is to provision a single machine that will run all the Binder services and servers. This machine needs to have the following installed:
 - [docker](https://docs.docker.com/engine/installation/)
 - [docker-compose](https://docs.docker.com/compose/install/)
 - [gcloud](https://cloud.google.com/sdk/)
 - [node](https://nodejs.org/)
 - [pm2](https://npmjs.org/package/pm2)

We highly recommend configuring this machine from a fresh compute instance on GCE, and the steps below will walk you through setting up a new machine from scratch. If you use your own machine, some of these steps may be unneccessary or may need to be modified. 

*Note* Configuration has only been tested on Linux, and may not yet work on Mac OS X.

First create an account on the Google Cloud Platform [website](https://cloud.google.com/). Then create a new project, and enable Google Compute Engine for your project. You'll need to ensure that you've added a billing account to the project. 

We recommend using a machine with Ubuntu 14.x, and at least 4 CPUs, 6 GB of RAM, and a 20 GB disk. In general, more CPU will enable faster build times, and more disk space will let you store more images. Also while configuring your machine, make sure to enable HTTP and HTTPS. We'll assume your project is called `binder` and your machine is called `binder-server`.

Now SSH into the machine and perform the following installation steps.

#### install `docker`

This is based on the official Docker [instructions](https://docs.docker.com/engine/installation/linux/ubuntulinux/). First execute these lines

```bash
sudo apt-get update
sudo apt-get install apt-transport-https ca-certificates
sudo apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys 58118E89F3A912897C070ADBF76221572C52609D
sudo vim /etc/apt/sources.list.d/docker.list
```

Then open `/etc/apt/sources.list.d/docker.list` with `vim` or any other editor and add the following line

```bash
deb https://apt.dockerproject.org/repo ubuntu-trusty main
```

Then proceed with the remaining steps

```bash
sudo apt-get update
sudo apt-get install linux-image-extra-$(uname -r)
sudo apt-get install apparmor
sudo apt-get install docker-engine
sudo usermod -aG docker <username>
```

Exit and log back in, then test that it's working with

```bash
docker run hello-world
```

#### install `docker-compose`

```bash
sudo -i
curl -L https://github.com/docker/compose/releases/download/1.7.0/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
su <username>
cd
```

Test that it's working with

```bash
docker-compose --version
```

#### install `gcloud`

```bash
wget https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-sdk-107.0.0-linux-x86_64.tar.gz
tar xvf google-cloud-sdk-107.0.0-linux-x86_64.tar.gz
./google-cloud-sdk/install.sh
```

Exit and log back in.

#### setup authentication

```bash
gcloud auth login
```

Respond to all instructions.

#### install `node`

We recommend using `nvm`

```bash
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh | bash
```

Exit and log back in, then call

```bash
nvm install 5.11.0
```

#### install `pm2`

```bash
npm install pm2 -g
```

#### install `binder-control`

```bash
npm install binder-control -g
```

#### configure the docker registry

Open the file `~/.binder/core.conf` and set the `docker.registry` field to `gcr.io/<project-name>` (in this example it would be `gcr.io/binder`)

## launch binder

Once you have a server provisioned as above, use this command to launch Binder

```bash
binder-control start-all
```

This will initiate a series of steps that launch the `build` and `deploy` servers and the `logging` and `db` services, and creates a Kubernetes cluster.

Respond to each prompt. You can leave most settings as is, though you may need to change them if e.g. you are running your own database or logging services. In the final step, when picking the size of your Kubernetes cluster, remember that *launching a cluster costs real money* and make sure to research hourly instance [costs](https://cloud.google.com/compute/pricing).

After the launch, use the following command to make the binder web client visible on port 80. Make sure that this iptables rule is not applied to the Docker bridge (usually `docker0`). Assuming that `eth0` is the interface that will be used by your server:

```bash
sudo iptables -i eth0 -A PREROUTING -t nat -p tcp --dport 80 -j REDIRECT --to-port 3000
```

Now visit `http://<your-server-ip-address>:80` and you should see the Binder web client.

## local deployments

Kubernetes can be passed an environment variable called `$KUBERNETES_PROVIDER`, which will specify the infrastructure to create the cluster on. The `kube-cluster` Binder service wraps this variable, and sets it to `gce` by default, but you will be prompted for other options when the service is started. Check out the Kubernetes [getting started](http://kubernetes.io/docs/getting-started-guides/) for more ways to launch Kubernetes clusters on different providers.

One of the supported providers is "vagrant", which will launch a local Kubernetes VM using VirtualBox. If you would like to run a purely local version of Binder follow these steps:

- Install [Vagrant](https://www.vagrantup.com/downloads.html)
- Set the `kube.provider` field in `~/.binder/deploy.conf` to "vagrant". This will alter the     behavior of the Binder proxy to work without external [load balancers](http://kubernetes.io/docs/user-guide/services/#type-loadbalancer)
- During `binder-control start-all`, select "true" when starting the `kube-cluster` service
- When prompted, change the Kubernetes provider from "gce" to "vagrant"

*Note* A local Kubernetes cluster will *not* work properly with the Binder proxy, and so  deployments will not be externally accessible (no proxying to notebooks from the WAN). The  Kubernetes VM is mainly useful for testing the `binder-deploy-kubernetes` module during development.

## other cloud providers

Other cloud providers supported by Kubernetes are currently untested, but feel free to try them out and submit PRs to update this documentation with provider-specific information.

## your own hardware

If you would like to set up a Kubernetes cluster on internal infrastructure i.e. at an institution, then the `binder-control start-all` script can be used, but do not start the `kube-cluster` service.

Instead, make sure to start your cluster with the configuration options (environment variables) defined [here](https://github.com/binder-project/binder-control/blob/master/services/kube-cluster/service.js#L71)

Also, for now, set the `kube.provider` configuration option in `~/.binder/deploy.conf` to "vagrant". This will configure the proxy service to be use a [NodePort](http://kubernetes.io/docs/user-guide/services/#type-nodeport) instead of a [LoadBalancer](http://kubernetes.io/docs/user-guide/services/#type-loadbalancer) (the latter is only supported by certain cloud providers).

## customizing your deployment

Using `binder-control start-all` is not the only way to launch Binder components. Each server and service can be independently configured and launched on different machines. If you would like to use a custom, forked version of `binder-build`, for example, you can manually start all the other servers and services as follows:

```bash
andrew@binder-tester:~$ binder-control start-service db
Starting 'start' - db
Finished 'start' - db
Started service db successfully
andrew@binder-tester:~$ binder-control start-service logging
Starting 'start' - logging
Waiting for logging containers to start up...
error: this is a test message app=test-app, module=logging-service
Finished 'start' - logging
Started service logging successfully
andrew@binder-tester:~$ binder-control web start --api-key=d33b55704a932a6582ffc381447781bb
Starting the binder-web server...
andrew@binder-tester:~$ binder-control deploy-kubernetes start --api-key=d33b55704a932a6582ffc381447781bb
Starting the binder-deploy-kubernetes server...
```

Then, you can start the build server separately:

```bash
andrew@binder-tester:~$ cd custom-build && npm start --api-key=d33b55704a932a6582ffc381447781bb
Starting the binder-build server...
```

## monitoring your deployment

The `binder-web` module provides a frontend for creating/deploying binders. It will be launched alongside other services when running `binder-control start-all` and can also be launched using `binder-control web start`. By default, it will be launched on port 3000 of your API server. Make sure that the machine running `binder-web` has an externally-visible IP address.
