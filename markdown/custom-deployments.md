# custom deployments

If you have needs that aren't met by the public cluster -- you want to use private data, or you need the guaranteed availability of a certain number of slots -- then the best way to use Binder is to launch your own custom deployment!

We've tried to make it as simple as possible to launch custom Binder deployments using either your own infrastructure or a cloud provider. The only requirements for setting up your own version of Binder are NodeJS, Docker and a Kubernetes cluster, all of which come bundled in the `binder-control` module for ease of use. 

If you're going to use your own Kubernetes cluster, Binder does not require SSH access to the cluster nodes, and only depends on the Kubernetes HTTP API, which should make integration simpler. Similarly, default versions of all other Binder components have been packaged into Docker images, making it simple to spin up Binder servers and services anywhere Docker is available.

Each Binder server is designed to be run independently, and the configuration files available in
the `~/.binder` directory enable a variety of different deployment types. ranging from the complete use of existing infrastructure (an existing Kubernetes cluster, database, etc.) to the complete use of Binder's included components launched using the provided command-line tools.

The public Binder cluster is running on GCE, and that is currently the most stable and tested  deployment setting. If possible, we recommend starting out with a GCE cluster and default settings using the command

```bash
binder-control start-all
```

### the fastest way

The quickest way to get started with Binder is to provision a single machine that will run all
the Binder services and servers (see the "services and servers" section of the "how it works" 
page). This machine needs to have the following tools installed:
 - [docker](https://docs.docker.com/engine/installation/): required for using any of Binder's built-in services, but not necessary if you're going to be using an existing
   database or logging stack.
 - [docker-compose](https://docs.docker.com/compose/install/): same requirements as for `docker`

Before proceeding, make sure that both Docker and Docker-Compose were installed correctly:
 - make sure `docker run hello-world` succeeds
 - make sure `docker-compose --version` succeeds

#### gce

To use GCE, you first need to make sure that the `gcloud` utility is configured and authenticated
on your newly-provisioned machine:
 1. Create an account on the Google Cloud Platform
 2. Create a new Project on the GCP, and enable Google Compute Engine for your project (ensure
   that the project is given a billing account)
 3. On your Binder server:
   1. Install the [`gcloud`](https://cloud.google.com/sdk/) CLI tool
   2. `gcloud auth login`
   3. `gcloud config set project <project-name>`

Now that `gcloud` is configured, proceed with the `binder-control` installation
 1. Install PM2: `npm install pm2 -g`
 2. Install `binder-control`: `npm install binder-control -g`

With everything installed, launch the servers/services
 1. `binder-control start-all`
   1. When prompted, choose to start the `kube-cluster` service
   2. When prompted, optionally start the `db` service (unless you provide your own db)
   3. When prompted, Optionally start the `logging` service (unless you provide your own logging stack)
   4. Leave the Kubernetes provider as "gce"
   5. Choose how large you would like to make your cluster (the number of Kubernetes minions)

*Note*: Launching a cluster costs real money and can get expensive! Make sure to research hourly instance [costs](https://cloud.google.com/compute/pricing) and select a node count that fits in your budget.

#### local

Kubernetes can be passed an environment variable called `$KUBERNETES_PROVIDER`, which will specify the infrastructure to create the cluster on. The `kube-cluster` Binder service wraps this variable, and sets it to `gce` by default, but you will be prompted for other options when the service is started. Check out the Kubernetes [getting started](http://kubernetes.io/docs/getting-started-guides/) for more ways to launch Kubernetes clusters on different providers.

One of the supported providers is "vagrant", which will launch a local Kubernetes VM using VirtualBox. If you would like to run a purely local version of Binder:

*Note*: A local Kubernetes cluster will _not_ work properly with the Binder proxy, and so  deployments will not be externally accessible (no proxying to notebooks from the WAN). The  Kubernetes VM is really only useful for testing the `binder-deploy-kubernetes` module.

1. Install [Vagrant](https://www.vagrantup.com/downloads.html)
2. Set the `kube.provider` field in `~/.binder/deploy.conf` to "vagrant". This will alter the     behavior of the Binder proxy to work without external [load balancers](http://kubernetes.io/docs/user-guide/services/#type-loadbalancer)
3. During `binder-control start-all`, select "true" for starting the `kube-cluster` service
4. When prompted, change the Kubernetes provider from "gce" to "vagrant"

#### other cloud providers

Other cloud providers supported by Kubernetes are currently untested, but feel free to try them out!

#### your own hardware

If you would like to set up a Kubernetes cluster on internal infrastructure, then the standard
`binder-control start-all` script can be used, but do not start the `kube-cluster` service.

Instead, make sure to start your cluster with the configuration options (environment variables) defined [here](https://github.com/binder-project/binder-control/blob/master/services/kube-cluster/service.js#L71)

Also, for now, set the `kube.provider` configuration option in `~/.binder/deploy.conf` to "vagrant". This will configure the proxy service to be use a [NodePort](http://kubernetes.io/docs/user-guide/services/#type-nodeport) instead of a [LoadBalancer](http://kubernetes.io/docs/user-guide/services/#type-loadbalancer) (the latter is only supported by certain cloud providers)

### customizing your deployment

Using `binder-control start-all` is not the only option! Each server/service can be independently configured and launched on different machines. If you would like to use a custom, forked version of `binder-build`, for example, you can manually start all the other servers/services (using an  arbitrary API key):

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

### accessing your deployment

The `binder-web` module (launched via `binder-control web start`) provides a frontend for creating/deploying binders. By default, it will be launched on port 3000 of your API server. Make sure that the machine running `binder-web` has an externally-visible IP.

Once the startup process has completed, your custom deployment will be accessible at `http://<machine-ip>:3000`
