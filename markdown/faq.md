# frequently asked questions

### Where is this running?

The public deployment is running on a small Google Compute Engine cluster.

### Who’s paying for it?

The public deployment is supported by [The Freeman Lab](http://thefreemanlab.com) at [HHMI Janelia
Research Campus](http://janelia.org). It is intended for open source and open science. We strongly
believe that reproducible science and analysis be available as a public service, and are working to
make this possible, in collaboration with like-minded groups.

### Do you plan to monetize this?

No. We will keep Binder available as a free, public service.

### Can I deploy the system myself?

Binder is 100% open-source, and you can absolutely deploy the current version yourself! Check out
the [Getting Started](TODO: link) section for instructions on how to launch your own custom Binder 
cluster.

### What’s the best way to access data?

For now, you should include your data in your repository. GitHub has reasonable limits on maximum
size (~200MB), and loading data that’s much larger can overwhelm the public cluster. If you need to
fetch data from external sources, all deployments do have full network access. Remember not to
insert private keys or other personal authorization information into a running Binder, as we don’t
provide any strong privacy guarantees. In the future, we will support loading versioned data via
[Dat](http://dat-data.com)

### What link should I share?

When a Binder is first launched, it’s assigned a unique identifier and can be accessed at a link
that looks something like <a href="">https://app.mybinder.org:80/2141553279/tree</a> where
2141553279 is the instance identifier for that deployment. These links are ephemeral and will not
work after one hour of inactivity, so we don’t recommend sharing them. If you’d like to share your
Binder, you can copy+paste the link from the GitHub badge, which looks like <a
href="">http://mybinder.org/repo/binder-project/example-requirements</a>. That link will launch a
fresh instance.

### Are my running deployments private?

Each Binder is launched with a unique identifier. These identifiers are not explicitly searchable,
but you should not assume that a running deployment is inaccessible to others. For now, we don't
recommend using Binder for any work that should not be tampered with or lost.

If you have stronger privacy requirements, then you might like to set up your own instance of
Binder.

### Should I put private content into a Binder?

No. We don’t provide any guarantees of privacy on the public cluster, so private keys and passwords
should never be inserted into a running deployment — or in a GitHub repo, of course! Your Binders
should only use code and data that’s freely accessible.

If you'd like to use private code and/or data inside a Binder, then the latest release (1.0.0)
should make it straightforward to set up your own Binder cluster!

### Can anybody build a Binder from my repository?

Yes. As of now, we do not require authentication when building from a repository. This makes it
simple to get started, but cannot prevent others from rebuilding an existing Binder.  In the earlier
version of Binder, we were depending on everyone’s goodwill to not rebuild binders with bad
parameters. In the 1.0.0 release we're constructing binders from the contents of a repository
alone. By doing this, any subsequent rebuilds on the same repository will be identical, and changes
to the environment will require changing the repository itself.

### Is there any extra information about the project?

We recommend this great [blog post](http://ivory.idyll.org/blog/2016-mybinder.html) by C. Titus
Brown.

### What’s the plan for future development?

The 1.0.0 version of Binder is a complete rewrite written in node.js. One of the main goals of this
version is to make it very simple to deploy Binder on any cloud provider that supports Kubernetes,
and to make it easy to use existing computational infrastructure if it's available. The entire
system can also be run and tested locally, facilitating development. It is built from the following
modules, each of which are independently versioned, documented, and tested:

 - [`binder-build`](https://github.com/binder-project/binder-build) : convert repositories into docker images
 - [`binder-control`](https://github.com/binder-project/binder-control): a CLI for launching binder
   services
 - [`binder-client`](https://github.com/binder-project/binder-client) : a CLI and API for interacting
   with binder services
 - [`binder-web-redux`](https://github.com/binder-project/binder-web-redux) : a generic front end
   for managing binder deployments 

The 1.0.0 release supports a stricter specification of Binders that will pin each deployment to a
particular version-controlled commit, branch, or tag, with all information necessary for the image
contained in the repository via a `.binder.yml` file. And Binders will be built deterministically
from repository content — build options will no longer be specified through a user interface. For
compatibility with existing behavior, builds can fall back to using language-specific dependency
files or Dockerfiles if they are present in the repository and if a `.binder.yml` does not exist.

### What’s the roadmap?

We're planning on adding new features over the next few months according to the following roadmap:

#### April 2016
 - Add https support to deployments [`binder-deploy-kubernetes`]
 - Support headless Binder kernels to connect to embeddable code cells [`binder-deploy-kubernetes`]
 - Use GitHub commit hooks to rebuild Binders when repositories change [`binder-build`]

#### May 2016
 - Integrate links to versioned data hashes using Dat [`binder-build`]
 - Add support for other version-control systems like BitBucket or GitLab [`binder-build`]
 - Add support for private repositories [`binder-build`]

#### June 2016
 - Support instantaneous deployment times using pools of pre-deployed Binders [`binder-deploy`]
 - Add support for user-provided Docker base images [`binder-build`, `binder-registry`]

