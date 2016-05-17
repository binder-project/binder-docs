# how it works

In this section we'll describe at a high level how each Binder component is implemented, and how you can inspect every component of a running deployment. It's probably a good idea to read this over before trying to launch a custom deployment.

## servers and services

Under the hood, Binder is composed of multiple [`express`](expressjs.com)-based servers that are managed by the [`PM2`](https://github.com/Unitech/pm2) process manager. Each server implements a subset of the Binder API, which is described in [`binder-protocol`](http://github.com/binder-project/binder-protocol) and the *api docs* section. Each server can be independently managed and tested through `npm` scripts like `npm start` and `npm test`. Currently, the
complete Binder API is implemented by two core modules:
 - [`binder-build`](http://github.com/binder-project/binder-build) implements the `build` and
   `registry` portions of the API
 - [`binder-deploy-kubernetes`](http://github.com/binder-project/binder-deploy-kubernetes)
    implements the `deploy` portion of the API

### services

Every Binder server depends on a few shared "services" that are accessed through common
interfaces. Currently, the services required for a complete, end-to-end deployment are:
 - a [MongoDB](mongodb.org) database wrapped by [Mongoose](mongoosejs.com) which will store all
   build and deployment-related information.
 - an ELK (Elasticsearch, Logstash, Kibana) stack which does centralized logging and serves live
   build logs
 - a Kubernetes cluster or single-machine Kubernetes VM, which can run Binder images

For simplicity we provide default, out-of-the-box versions of these services via the command-line tool [`binder-control`](https://github.com/binder-project/binder-control). The command 

```bash
binder-control start-service <service-name>
```
will launch Docker images for the given service using Docker Compose — for more details about this process, check out the *custom deployments* section.

You can also deploy these services yourself and point to them by inserting the appropriate configuration options in the configuration files in `~/.binder` described below.

The database and logging services are accessed through the [`binder-db`](http://github.com/binder-project/binder-db) and [`binder-logging`](http://github.com/binder-project/binder-logging) modules, which connect to their respective services.

*Note* These services *must* be available to the server at all times, even during testing.

### inspecting servers and services with PM2

To inspect the `binder-build` or `binder-deploy-kubernetes` servers, you can either use the PM2
module directly, or you can use wrapper functions defined in `binder-control`. For example, the following commands both list all running servers and services

```bash
pm2 list
```

```bash
binder-control status
```

Generally the `binder-control` commands will be easier to use, but it's worth knowing some simple PM2 commands in case you run into trouble. The most important command that `binder-control` does not wrap is `PM2 logs <server-name>`, which  will stream the logs from any server or service listed by `binder-control status`. This can come in handy when things go wrong!

### configuration

Every server and service has a `postinstall` script that inserts a configuration file into the
`~/.binder` directory. A complete installation should contain the following configuration files:

```bash
andrew@binder-tester:~$ ls ~/.binder
build.conf  core.conf  db.conf  deploy.conf  logging.conf  web.conf
```

Each config file is written as JSON and is easily modifiable. If you'd like to change the behavior of a running server (for example, to change the port for `binder-build`), you can make the change then explicitly restart the server:

```bash
andrew@binder-tester:~$ cat ~/.binder/build.conf
{
  "db": {
    "host": "localhost",
    "port": 9050
  },
  "logging": {
    "host": "localhost",
    "logstash": {
      "port": 8050
    }
  },
  "docker": {
    "enabled": true,
    "email": "N/A",
    "registry": "",
    "host": "localhost"
  },
  "port": 8082 <--- change this to 9999
}
andrew@binder-testing:~$ binder-control build stop && binder-control build start
```

## the client

We provide client code for interacting with the Binder API in the [`binder-client`](http://github.com/binder-project/binder-client) module. The client can be used either through the CLI tool `binder` or by importing it as a node module via `require('binder-client')`. More details can be found in the `binder-client` documentation. 

In the next section, we'll go through the inner workings of Binder by explaining step-by-step how 
a simple GitHub repository is built and deployed onto a Kubernetes cluster. Each step is initiated
through the `binder-client` CLI. You can follow along by first setting up a custom deployment as 
described in the *custom deployments* section, and making sure that `binder-client` is installed 
on your machine.

## fetching data and code

The very first step in the build process is to fetch the data and code that's going to be bundled into a Binder image. All fetching logic is contained in the `binder-build` module, and is delegated to the "source handlers" contained in the `lib/sources` directory. An example source handler can be found [here](https://github.com/binder-project/binder-build/blob/master/lib/sources/github.js). Currently GitHub is the only supported source, but it should be easy to add others (like BitBucket).

Each source handler is responsible for:
 - Fetching and extracting the actual repository into a directory, given some identifier string 
   (in the GitHub handler's case, that string is the repository URL)
 - Generating a display name from that identifier string (repo URL -> org-name/repo-name)
 - Generating an image id that will be used throughout the build process 
   (repo URL -> org-name-repo-name)

Using the [`binder-project-example-requirements`](http://github.com/binder-project/example-requirements) repository as an example, we'll first initiate a build:

```bash
andrew@binder-tester:~$ binder build start http://github.com/binder-project/example-requirements --host=localhost --port=8082 --api-key=415f843bc7893ea431178d7ee650117e

Starting Binder build for repository: http://github.com/binder-project/example-requirements

Build succesfully started for repository: http://github.com/binder-project/example-requirements
{
 "repository": "http://github.com/binder-project/example-requirements",
 "name": "binder-project-example-requirements",
 "display-name": "binder-project/example-requirements",
 "start-time": "2016-04-25T09:02:51.035Z"
}
```

When the build is first started, the repository will be fetched into the `apps/` directory, and a build entry will be inserted into the database. We can view the contents of the `binder` database using the `mongo` client:

```bash
andrew@binder-tester:~$ mongo --host=localhost --port=9050
MongoDB shell version: 2.4.9
connecting to: localhost:9050/test
> use binder
switched to db binder
> db.builds.find({"name": "binder-project-example-requirements"})
{ "_id" : ObjectId("571d41b8ba40da19ff352204"), 
  "name" : "binder-project-example-requirements", 
  "startTime" : ISODate("2016-04-25T09:02:51.035Z"), 
  "status" : "completed", 
  "phase" : "finished", 
  "repo" : "http://github.com/binder-project/example-requirements", 
  "displayName" : "binder-project/example-requirements", 
  "__v" : 0 
}
```

## creating executable environments

Once the code and data have been fetched, we bundle it all into a Docker image that can be rapidly scheduled and executed on a cluster.

### docker

Docker is a tool for specifying computational environments using a configuration file called a `Dockerfile`. A `Dockerfile` is a set of directives that are executed sequentially, gradually building an environment one layer (filesystem change) at a time. 

The [`binder-build-core`](http://github.com/binder-project/binder-build-core) module is responsible for finding supported dependency files inside a directory and constructing a Docker image out of those dependency files. 

### dependency handlers

Converting a directory into a Docker image is managed by a set of "dependency handlers," which can be found in [`dependencies`](https://github.com/binder-project/binder-build-core/tree/master/dependencies) of `binder-build-core`. Each dependency handler manages a single filetype (i.e. `requirements.txt`)  and provides the following:
 - a precedence: defines which dependency files should take priority if multiple are present in
   a directory
 - a `_generateString` method: given the handler's filetype of interest, return a list of
   Dockerfile directives
 - (optional) a `JSONSchema` or `YAMLSchema` that will be applied to the
   file before further handling

Each dependency handler will add lines to a Dockerfile, and that Dockerfile will immediately be used to build a Docker image. Every Dockerfile generated by `binder-build-core` must be based on one of several Binder-compatible base images. We use the base image `andrewosh/binder-base` for common Python dependency files (`requirements.txt` and `environment.yml`). But the Dockerfile can use any of the following alternative base images:
 - `andrewosh/binder-python-2.7` - a full Anaconda 2 installation
 - `andrewosh/binder-python-2.7-mini` - uses Miniconda instead of Anaconda
 - `andrewosh.binder-python-3.5` - a full Anaconda 3 installation
 - `andrewosh/binder-python-3.5-mini` - uses Miniconda instead of Anaconda

We plan to add additional base images for other languages and configurations.

Continuing with the `binder-project-example-requirements` example, the build process will generate
the following Dockerfile:

```bash
FROM andrewosh/binder-base:latest
RUN mkdir /home/main/notebooks
RUN chown main:main /home/main/notebooks
WORKDIR /home/main/notebooks

USER root
ADD * /home/main/notebooks/
RUN chown -R main:main $HOME/notebooks
USER main

RUN find $HOME/notebooks -name '*.ipynb' -exec ipython trust {} \;

ADD requirements.txt requirements.txt                *
ADD handle-requirements.py handle-requirements.py    *
RUN python handle-requirements.py                    *

USER main
WORKDIR $HOME/notebooks
```

The lines ending with '*' were inserted by the dependency handler — the remaining lines are common to all generated Dockerfiles.

See the `binder-build-core` and `binder-build` documentation pages for more details about the build process, including the order of precedence of the dependency files.

### image pushing

Once the Docker image has been built, `binder-build-core` will optionally push the image to a private registry or to DockerHub, depending on the configuration options specified in `~/.binder/build.conf`. The registry location can be specified in the config file.

*Note* The registry that the image is pushed to must be accessible to all the nodes of the Kubernetes cluster.

### templates

While the Docker image contains most of the information necessary to create a reproducible, executable environment, there are other parameters that can affect how that image is scheduled on a cluster. For example, specifying default memory or cpu limits or other hardware requirements  that the image requires. For this purpose we create an additional data structure called a *template*, which is stored in the `templates` collection in the Binder database. There is now a one-to-one relationship between Binder images and templates, though this could be relaxed in the future.

Continuing our example, once the `binder-project-example-requirements` Docker build has completed, and the image has been pushed to our private Docker registry, we construct a template:

```bash
andrew@binder-tester:~$ mongo --host=localhost --port=9050
MongoDB shell version: 2.4.9
> use binder
switched to db binder
> db.templates.find({ "name": "binder-project-example-requirements" })
{ "_id" : ObjectId("571d45c8ba40da19ff352205"), 
  "port" : 8888, 
  "image-source" : "gcr.io/binder-testing/binder-project-example-requirements", 
  "name" : "binder-project-example-requirements", 
  "image-name" : "binder-project-example-requirements" 
}
```

In this case, no limits were specified, and the template does not provide much additional information beyond what's contained in the Docker image. The template is now schedulable on a cluster — we're ready to deploy!

## deploying and accessing containers

The `build` and `deploy` stages are decoupled — templates can be scheduled onto any backend that implements the `deploy` API. In the current Binder release, the only supported backend is Kubernetes (implemented in [`binder-deploy-kubernetes`](http://github.com/binder-project/binder-deploy-kubernetes)).

Kubernetes is a container management system that schedules containers (instances of Docker images) onto nodes in a cluster according to resource constraints and availability. Kubernetes also provides abstractions for managing collections of containers, connecting containers together, and restricting communication between containers. It's super cool — here's some general Kubernetes [documentation](http://kubernetes.io/docs/).

### creating a pod

One of the many entities provided by Kubernetes is the "pod" — a collection of running containers colocated on the same cluster node that can communicate with each other through localhost. At this stage, Binder will take a template and convert it into a pod specification, which will then be scheduled onto the cluster.

Launching the pod is not quite enough, unfortunately. By default, pods are not externally accessible outside of the cluster's internal network. Additionally, when an pod is first scheduled onto a node, that node will have to pull any Docker images that are not already present from the registry, which can take up to a minute.

To solve these problems, we introduce:
 - a proxy pod - proxy routes are registered with a proxy pod that has access to both the external WAN and the internal network
 - a preloading step - `binder-deploy-kubernetes` exposes a `_preload` hidden API method that will schedule a pod onto every node of the cluster, forcing an image pull on each of those nodes.

These components are described in more detail below.

The complete pod generation process is located in [`lib/state/app.js`](https://github.com/binder-project/binder-deploy-kubernetes/blob/master/lib/state/app.js) in the `binder-deploy-kubernetes` module.

### preloading

In order to support near-instantaneous (5-10s) deployment times, we need to ensure that every Docker image being scheduled onto a node is already present at deploy time. Since we don't require SSH access into the cluster nodes, and the Kubernetes scheduler is still early and in rapid development, our preloading step might appear slightly hacky: We iterate over every node in the cluster, tag that node with a label that matches the template name, and then schedule a pod onto that node with a cull timeout (described below) of 1 second.

This means that if there are N nodes in your cluster, the preloading step will launch N pods, but those pods will be immediately removed the next time the cleanup job runs.

Kubernetes automatically garbage-collects old, unused images in LRU order. For this reason, we  cannot guarantee instantaneous deployment times for very old, unused images until the node has been "refreshed" with that image (after the very first launch).

### the proxy

The proxy pod is what enables external access to pods scheduled onto the cluster. We used a  modified version of Jupyter's [`configurable-http-proxy`](https://github.com/andrewosh/configurable-http-proxy) that's been augmented with a MongoDB database.

Every time a Binder pod is scheduled, a route is registered with the proxy pod, and the proxy proxies requests from an externally-visible endpoint to that route, which points to an internal combination of IP and port.

Alongside the proxy pod, we create two proxy [Services](http://kubernetes.io/v1.0/docs/user-guide/services.html), the `proxy-lookup-service` and the `proxy-registration-service`. When run on a cloud provider like GCE, both services are assigned load balancers and external IP addresses:
 - the `proxy-lookup-service` will extract the path from its URL (i.e. `http://<lookup-ip>/path/to/pod`)
   and proxy requests to an internal IP (i.e. `<pod-ip>:8888`)
 - the `proxy-registration-service` will register the mappings used by the lookup service — `POST` requests are sent to this endpoint whenever new pods are created

### cleanup

Every Binder deployment is assigned a `cull-timeout`, which is the duration for which the pod can be inactive (no HTTP requests have been proxied to it) before being deleted. By default, Binder assigns every pod a 1-hour cull-timeout, except for the preloader pods described above.
