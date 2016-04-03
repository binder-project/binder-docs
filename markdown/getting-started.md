# getting started

If your code and data are public, and you don't have any major availability concerns (you won't
need to guarantee that 200 slots will be available for a tutorial), then sticking with Binder's
public cluster is probably your best bet. We currently have 700 slots available for concurrent use,
and we plan on increasing this number as necessary.

### creating your repo

Regardless of how you plan on deploying your binder, your very first step is to create a
GitHub repository containing both your code/data and a Binder-compatible environment specification
file. If your point Binder to a repository that has this form, it will use the repo contents to
construct an executable environment.

There are many different environment specification files you can insert into your repository to
direct the build process, and we're looking to add more! As of now, we support:

#### .binder.yml

If possible, try to use a `.binder.yml` file over all other options, as it allows for a more
complete environment description and is more future-proof

The `.binder.yml` file is designed to act as a middle-ground between simple, language-specific
configuration files (like `requirements.txt`) and the more complete, but more complicated
`Dockerfile`. We drew inspiration from continuous integration tools like Travis 

TODO: resume here

#### requirements.txt

Check out an example of using a `requirements.txt` file
[here](https://github.com/binder-project/example-requirements)

#### environment.yml

Check out an example of using an `environment.yml` file
[here](https://github.com/binder-project/example-conda-environment)

#### custom dockerfile

Check out an example of using a custom `Dockerfile`
[here](https://github.com/binder-project/example-dockerfile)

#### referencing libraries in your repo

During the build process, the contents of your repository are inserted into a Docker image
at `/home/main/notebooks`, so if you include custom libraries in your repository, you should can
import them from within your notebook at `/home/main/notebooks/<library name>`.

#### index.ipynb

Binder expects your analyses to be contained in Jupyter notebooks, and if you include a special
notebook called `index.ipynb`, we will consider that to be the main entrypoint into your
application and users will be redirected directly to that notebook when they click your Binder badge.

#### examples

If you need help creating your repository, there are many examples available
[here](https://github.com/binder-project) (they're the repositories that begin with `binder-project-example`).

Also, there are tons of community-created examples that you can explore through this
[visualization](http://mybinder.org/feed)

### launching a custom cluster

If the public cluster doesn't meet your needs, then you can run modified versions of any Binder
component in your own custom deployment. The simplest way to do this is through the
[`binder-control`](https://github.com/binder-project/binder-control) module, which wraps all other
server-side Binder services and provides an interactive CLI tool for starting/stopping them.

The `binder-control`
[README](https://github.com/binder-project/binder-control/blob/master/README.md) file contains
step-by-step instructions for provisioning a machine with all the necessary prerequisites, setting
up a Kubernetes cluster and starting the Binder servers.
