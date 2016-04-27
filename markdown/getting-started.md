# getting started

This guide describes how to build a Binder from a GitHub repository using the public Binder cluster at [mybinder.org](http://mybinder.org).

## environment specification

Your very first step with Binder is to create a GitHub repository containing your code, data, and a Binder-compatible environment specification file. If you point Binder to a repository that has this form, it will use the repository contents to construct an executable environment.

There are many different environment specification files you can insert into your repository to direct the build process; if you're interested in adding more, submit an issue or pull request to the [`binder-build`](https://github.com/binder-project/binder-build) repository. 

*Note* Unlike in previous versions, you cannot specify which dependency file to use in the web interface; instead, files will be looked for and used in the order listed here.

Binder currently supports the following configuration files:

### `requirements.txt`

This is a file used by Python and the Python package manager [`pip`](https://github.com/pypa/pip) for listing a set of project dependencies with optional version specifications. Check out an example repository that uses a `requirements.txt` file [here](https://github.com/binder-project/example-requirements).

### `environment.yml`

This is a file used with the package management system [`conda`](https://github.com/conda/conda), and can specify both a language version, and a set of package dependencies. Check out an example repository that uses an `environment.yml` file [here](https://github.com/binder-project/example-conda-environment).

### `Dockerfile`

Under the hood, Binder uses [`docker`](https://github.com/docker/docker) to build images, and it is possible to specify a Binder by directly providing a `Dockerfile`. Check out an example of using a custom `Dockerfile` [here](https://github.com/binder-project/example-dockerfile). When using a `Dockerfile`, we recommend testing your build in a local environment before submitting to Binder, as it will be easier and faster to debug build errors. All builds with Dockerfiles must be based off of one of the following base images: `binder-base`, `binder-base-minimal`.

## assets 

During the build process, the entire contents of your repository are inserted into a Docker image at `/home/main/notebooks`. This can be used in a few different ways.

### custom libraries

If you include custom libraries in your repository, you can import them from within your notebook at `/home/main/notebooks/<library name>`. 

### data

If your repository contains data, you can load it directly from `/home/main/notebooks/<path to data>`. For small data files — less than a couple hundred MBs — we recommend putting them directly in your repository. For larger data files, if you can make them publicly available in cloud storage like Amazon S3, you can load them into your environment at run time. We are exploring ways to integrate with the [`dat`](http://dat-data.com) project to better support versioned data.

### the `index.ipynb` file

Binder expects your analyses to be contained in Jupyter notebooks. If you include a special notebook called `index.ipynb`, Binder will treat that as the entrypoint into your application, and users will be redirected directly to that notebook when they launch your Binder.

## examples

If you need help creating your repository, there are many examples available on [GitHub](https://github.com/binder-project). Look at all the repositories that begin with `binder-project-example`. There are also more than 1000 community-created examples that you can explore through this [visualization](http://mybinder.org/feed).
