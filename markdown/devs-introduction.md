# overview

> for developers

Binder is written in node.js, and is implemented as a collection of modules that together support building repositories into Docker images, and then deploying Docker containers across a cluster. At a high-level, a complete Binder "deployment" consists of several services that run the various Binder components, and a compute cluster on which containers are deployed (currently only Kubernetes is supported). In a real deployment, you'll typically run all the services together on a single server co-located with your cluster. But because each component is written as a separate module, you can easily install each one locally for testing or developing new features.

All the services are written to conform to an API defined in [`binder-protocol`](https://github.com/binder-project/binder-protocol). The core components of the API are:

- `build` the process of turning repository contents into a Docker image
- `register` combining a Docker image with a template specification for deployment
- `deploy` launch a template on a cluster

The easiest way to set up and interface with Binder services are through [`binder-control`](https://github.com/binder-project/binder-control) and [`binder-client`](https://github.com/binder-project/binder-client).

[`binder-control`](https://github.com/binder-project/binder-control) wraps all Binder services and provides an interactive tool for starting and stopping them. For example, if you launch a fresh instance on Google Compute Engine, and install the requirements, you can start all Binder services with

```bash
binder-control start-all
```

[`binder-client`](https://github.com/binder-project/binder-client) is a command-line tool for interfacing with running Binder services. For example, you can use it to `build` a Binder, `deploy` a container, or `fetch` info for all running versions of a container.

See "how it works" for a more detailed description of Binder's internals, and see "custom deployments" for detailed instructions on how to start and manage your own Binder deployment using [`binder-control`](https://github.com/binder-project/binder-control) and [`binder-client`](https://github.com/binder-project/binder-client). 