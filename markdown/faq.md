# frequently asked questions

These are questions that frequently come up for users of the public Binder deployment.

### where is this running?

The public deployment is running on a small Google Compute Engine cluster.

### who's paying for it?

The public deployment is supported by [The Freeman Lab](http://thefreemanlab.com) at [HHMI Janelia Research Campus](http://janelia.org). It is intended for open source and open science. We strongly believe that reproducible science and analysis be available as a public service, and are working to make this possible, in collaboration with like-minded groups.

### do you plan to monetize this?

No. We will keep Binder available as a free, public service, and all the code is and will remain 100% open source.

### can I deploy the system myself?

Yes! Check out the "devs" section for instructions on how to launch your own custom Binder deployment.

### what's the best way to access data?

For now, you should include small data in your repository. GitHub has reasonable limits on maximum
size — a couple hundred MBs. If you need to fetch large data from external sources like Amazon S3, all deployments do have full network access. Remember not to insert private keys or other personal authorization information into a running Binder, as we don’t provide strong privacy guarantees. In the future, we will support loading versioned data via [`dat`](http://dat-data.com).

### what link should I share?

When a Binder is first launched, it’s assigned a unique identifier and can be accessed at a link that looks something like <a href="">https://app.mybinder.org:80/2141553279/tree</a> where 2141553279 is the instance identifier for that deployment. These links are ephemeral and will not work after one hour of inactivity, so we don’t recommend sharing them. If you’d like to share your Binder, you can copy+paste the link from the GitHub badge, which looks like <a href="">http://mybinder.org/repo/binder-project/example-requirements</a>. That link will launch a fresh instance.

### are my running deployments private?

Each Binder is launched with a unique identifier. These identifiers are not explicitly searchable, but you should not assume that a running deployment is inaccessible to others. We don't recommend using the public Binder cluster for any work that should not be tampered with or lost. If you have stronger privacy requirements, you might like to set up your own Binder deployment.

### should I put private content into a Binder?

No. We don’t provide any guarantees of privacy on the public cluster, so private keys and passwords should never be inserted into a running deployment — or in a GitHub repo, of course! Your Binders should only use code and data that’s freely accessible. If you'd like to use private code and/or data inside a Binder, then you might like to set up your own Binder deployment.

### can anybody build a Binder from my repository?

Yes. We do not require authentication when building from a repository. This makes it
simple to get started, but cannot prevent others from rebuilding an existing Binder. However, as of the 1.0.0 version Binders are specified deterministically from repositoey contents. So repeated rebuilds of the same repository will be identical, and changes to the environment will require changing the repository itself.

### is there any extra information about the project?

We recommend this great [blog post](http://ivory.idyll.org/blog/2016-mybinder.html) by C. Titus Brown.

### how can I get involved?

We welcome new contributors! Check out the "devs" section of this documentation site, open an issue or pull request on one of the project repositories on [GitHub](https://github.com/binder-project), or come talk to us in the [chatroom](https://gitter.im/binder-project/binder).