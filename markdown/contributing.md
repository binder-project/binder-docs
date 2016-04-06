# contributing

Binder is 100% open source software, so it's free to be used however you like. We're always eager to have new contributors join the project, and there are several places to jump in! 

With its new 1.0.0 release, Binder is now organized into several modules, each of which are independently versioned and tested. We've also tried to make it easy to set up a local development environment, to work on any of these components in isolation, or to test the entire system.

Check out the issue trackers on any of the repositories on [GitHub](https://github.com/binder-project), and see below for a rough roadmap of features we're currently trying to prioritize. If you have suggestions, or are looking for advice on where to start contributing, open an issue on one the issue trackers, or come join us in the
[chatroom](https://gitter.im/binder-project/binder)!

## roadmap

Here are some features we'd like to add over the next months, with the module(s) they most directly affect.

#### april 2016

 - Add https support to deployments [`binder-deploy-kubernetes`]
 - Use GitHub commit hooks to rebuild Binders when repositories change [`binder-build`]

#### may 2016

 - Integrate links to versioned data hashes using Dat [`binder-build`]
 - Add support for other version-control systems like BitBucket or GitLab [`binder-build`]
 - Add support for private repositories [`binder-build`]

#### june 2016

 - Support instantaneous deployment times using pools of pre-deployed Binders [`binder-deploy`]
 - Add support for user-provided Docker base images [`binder-build`]
 - Support headless Binder kernels to connect to embeddable code cells [`binder-deploy-kubernetes`]
