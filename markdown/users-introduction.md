# introduction

> reproducible computation on demand

Binder is a collection of tools for building and executing version-controlled computational environments that contain code, data, and interactive front ends.

Version control and social coding sites like GitHub make it simple to share code, and projects like the Jupyter notebook provide interactive interfaces for language-agnostic analysis. But executing that code remains a hurdle — dependencies, data, and system configuration are less portable than code, and are more difficult to specify. Binder has two primary goals: to make it easy to construct reproducible environments, even without knowledge of containerization technology; and to make these environments available for instantaneous deployment in the browser.

A public Binder cluster is hosted at [mybinder.org](http://mybinder.org) and supported by HHMI Janelia. It lets anyone build and deploy computational environments, and currently hosts more than 1000 builds. Binder itself is 100% open source software, and we've tried to make it as easy as possible for others to deploy their own version of a Binder cluster.

If you just want to share your code by building a Binder on the public cluster, continue reading the "users" section, or just head over to [mybinder.org](http://mybinder.org) and try it out!

If you need to manage a custom deployment — because you're running a large course and need to guarentee availability, or because you have sensitive data or code that can't be public — or if you'd like to learn about how Binder works and contribute to the project, check out the "devs" section.