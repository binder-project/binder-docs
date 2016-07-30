# release notes

Binder is composed of several smaller modules that each have their own versions, and follow semantic versioning. The full public Binder deployment itself does not really have a "version", but we can pretend it does! 

We'll start with 1.0.0, and update the verison any time one of the underlying components changes and we put that updated component into production. We'll try to follow semantic versioning in so far as it makes sense for a web service: major number for changes that break the user experience e.g. something that used to work doesn't work anymore, minor number for new backwards-compatible user-facing features, and patch number for bug fixes.

This document will serve as a best effort to list changes as new versions are released.

---------

## 1.0.0
#### July 11, 2016

This is first deployment of Binder's node-based infrastructure, and is a major update to the version that has been running in production up until now. It's basically a complete rewrite of the entire codebase, in a new language. It has a number of new features, and hopefully improved stability and performance. There are also probably some bugs that we'll need your help identifying and fixing!

The most important changes are:

#### `#1`
Binder builds are now deterministic. When you submit a repository to build a Binder, you no longer specify which dependency file you want to use e.g. `requirements.txt` or `Dockerfile`. Instead, we will check the specified repository for dependency files in the following preference order: 
- `Dockerfile` — for custom Docker builds 
- `requirements.txt` — for simple Python builds using `pip`
- `environment.yml` — for more complicated Python builds using `conda`

Make sure your repository contains the dependency file(s) you want! Usually you'll just need one, though there are a small number of cases in which it makes sense to have two, for example: you use a `Dockerfile`-based build but your repostiry contains a `requirements.txt` file that is referenced in the `Dockerfile`. 

With this change, so long as a repository does not change, the image built from that repository will always be the same. In effect, this means that only people with write access to a repository can change the corresponding Binder. This should hopefully prevent situations in which builds that once worked no longer work due to rebuilding with incorrect dependency specifications.

#### `#2`
There are now several alternative base images for `Dockerfile` based builds, and they come in various sizes. Currently all include Python. They are:
- [`binder-python-2.7`](https://github.com/binder-project/binder-build-core/blob/master/images/python/2.7/Dockerfile)
- [`binder-python-3.5`](https://github.com/binder-project/binder-build-core/blob/master/images/python/3.5/Dockerfile)
- [`binder-python-2.7-mini`](https://github.com/binder-project/binder-build-core/blob/master/images/python/2.7-mini/Dockerfile)
- [`binder-python-3.5-mini`](https://github.com/binder-project/binder-build-core/blob/master/images/python/3.5-mini/Dockerfile)

The first two are full anaconda installations, and the second two are miniconda installations. If you want to make a Binder that uses another language e.g. Julia or R, we recommend using one of the `binder-python-x-mini` base images for now, because it will make your build as small as possible. We will also likely add base images for those langauges in the future.

#### `#3`
We've added a new, more robust procedure for monitoring cluster status. Every minute we both build an image and deploy it to the cluster, and show the results at [mybinder.org/status](http://mybinder.org/status). This both ensures that builds are possible and that images can be deployed, whereas before we only displayed whether network requests to the server were possible. This should help us track system status and identify and fix problems when they arise.

#### `#4`
We no longer support additional services for Binder builds e.g. Spark and Postgres. We found that these were rarely used, and they added significant complexity to the system and protocol. We may add similar functionality in the future, but for now these options are not availiable.

#### `#5`
There's a new loading screen that will be displayed when a Binder is launched, and remain until it is ready to be used. This should prevent long waits on blank screens that might otherwise suggest a failed launch.

#### `#6`
If a build fails, and someone tries to launch the Binder for that repo, then we will deploy the last successful image for that repository. Previously, we would redirect the user to a failure page. This ensures that so long as a build was successful once, Binder badges will always function correctly.

#### `#7`
The URL structure has changed: the build status page that was previously at `mybinder.org/repo/<org>/<name>/status` is now at `mybinder.org/status/<org>/<name>`