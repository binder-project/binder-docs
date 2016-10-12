## binder maintence notes

#### things to know how to fix

- [x] a build hangs and need to restart it
- [x] kubernetes master becomes unresponsive
- [x] web + deploy server failure
- [x] services server failure
- [x] build server failure
- [x] status is myseriously down


#### open issues

- [ ] proxy server is holding on to old routes during preloading
- [ ] bug in kube-stream that causes the restart count to go up
- [ ] something with lowercase/uppercase names
- [ ] `binder-kubernetes-proxy` might not be using the correct `kubectl`
- [ ] add a kron job that runs the spotify clean up script



#### gce notes

project name `Binder Testing`

lists all services running

`binder-api` used as a management server

`binder-services` database and logging stack

`binder-web-deploy` is the web + deploy + health checker server

`kubernetes-master` + all the `minions`

To log in...

```
gcloud config set project binder-testing
glcoud compute ssh binder-api --zone=us-central1-a
```

If I have trouble sshing, go to `.ssh/google_compute_engine.pub` and copy paste into SSH keys section in UI

#### inspecting a server

starting with

```
gcloud compute ssh binder-services --zone=us-central1-f
```

to check basic status

```
pm2 list
```

look in the restart columns for high restart counts, should never have high restart counts for anything, if they do, it means that something's failing

to see all logs

```
pm2 logs
```

to delete a service directly with `pm2`

```
pm2 delete binder-db-service
```

but first do

```
binder-control stop-service binder-db-service
```

to manage the services, it's always 

```
binder-control start-service binder-db-service
binder-control stop-service binder-db-service
```

to manage the servers, it's

```
binder-control health start
binder-control health stop
```

starting and stopping the servers we need an API key

#### simple debugging ideas

try to `ssh` into a server, if it fails, and it's not about permissions, then something's wrong

example: the `binder-services` node went unresponsive, so log into `binder-deploy` node, check logs, saw that the database connection was failing, couldn't telnet into the database

#### example: checking on the database when can't connect `binder-services` 

first log into `binder-web-deploy` with `gcloud compute ssh binder-web-deploy `

check the servers it's connecting to using

```
cat ~/.binder/deploy.conf
```

could get host and port for database and then do

```
telnet 104.198.247.206 8050
```

#### updating the web site in production

similar update path for any other modules

make changes and publish a new version of `binder-web`

log into `binder-web-deploy`

do `pm2 list` to see what's running

reinstall all modules with

```
npm install binder-control -g
```

stop the web server

```
binder-control web stop
binder-control web start --api-key=***
```

any server or service should be deployed this way, the full set is

```
binder-control health stop
binder-control health start
binder-control deploy-kubernetes stop
binder-control deploy-kubernetes start
```

#### (1) hanging builds

counter intuitively, we're going to do this by logging into the database server and updating the database, which means there should be periodic backups

log in to `binder-services`

```
gcloud compute ssh andrew@binder-services --zone=us-central1-f
```

connect to `mongo`

```
mongo --host=localhost --port=9050
```

type `use binder` to switch to `binder`

try `db.builds.count()` to get all builds and `db.templates.count()` to get all templates

list all running builds with `db.builds.find({"status":"running"})` 

if a build is in a weird state on the status page, or has a old build time, it's probably stalled out

to set the status for a particular build to failed

```
db.builds.update({"name": "***"}, {$set: {"status": "failed"}})
```

then rebuild from the web UI, if you do this you shouldn't see the same build show up

```
db.builds.find({"status":"running"})
```

#### (2) kubernetes master becomes unresponsive

command line tool for kubernetes is in `~/kubernetes/cluster/kubectl.sh`

get all nodes with `kubectl get nodes`

**if the master is down these requests should fail** so `kubectl get nodes` is a good check

get all nodes in the current namespace with `kubectl get pods`

all deployed binder pods live in their own namespaces

get pods from all namespaces using `kubectl get pods --all-namespace`

then inspect a particular namespace using `kubectl get pods --namespace=f45664434bbf62c2ba672e963873e6c4`

get more info with `kubectl describe pod frontend-server --namespace=f45664434bbf62c2ba672e963873e6c4`

another good check is to ssh into the kuberneetes master

call this from either inside `binder-web-deploy` or anywhere else

```
gcloud compute ssh kubernetes-master --zone=us-central1-b
```

top on the master will show memory usage

best way to restart `kuberenetes-master` is to go into web UI, click on it, then click restart

once it's restarted try `ps aux | grep kube` on `kuberenets-mater` to monitor processes coming back online (there are a lot)

then check the health status to make sure the deploy server comes back up

#### (3) web + deploy server failure and how to restart

everytime a service managed by`pm2` fails should auto restart

but at least once `pm2` lost track of the `binder-kuberenets-deploy-start` server

so when you logged in, it was just gone, but the subprocesses (e.g. the daemon) was still running

diagnosis: after `pm2 list` no `binder-deploy-kubernetes-start`and two `binder-kubernetes-daemon`

if we need to restart the `binder-web-deploy` node, first thing is to get the API key by doing `pm2 logs binder-health-checker-start` or the logs from another service

type `sudo reboot` andrew prefer's this to just using the web UI but he wouldn't explain why

type `pm2 list` and it should show nothing but say that PM2 daemon is starting

to start everything back up

```
binder-control web start --api-key=***
```

start proxy manually by doing inside a screen

```
screen ./kubectl.sh proxy --port=8085
```

now do

```
binder-control deploy-kubernetes start --api-key=***
```

and then start the health server

```
binder-control health start --api-key=***
```

and then fix the IP tables

```
sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 3000
```

possible failure mode: if we start `deploy-kubernetes` before starting the `proxy`server manually, there appears to be a bug, the way to fix it is to delete all the `deploy-kubernetes` components in `pm2` which are `binder-deploy-kubernetes-start` and `binder-kubernetes-daemon` and  `binder-kubernetes-proxy` and then screen start the proxy (if we haven't already) and then restart everything

#### (4) services node failure and how to restart

to identify it, check if we can `ssh` into the `binder-services` node, and if we can't, confirm that we can't connect to the database (see above)

in this scenario, restart the node from the console UI, then `ssh` back into it, then run this sequence of commands, doesn't require an API key

```
binder-control start-service db
binder-control start-service logging
```

#### (5) build server issues

main issue is disk storage build up that requires periodic clean up

log in with `gcloud compute ssh andrew@binder-tester-2 --zone=us-central1-f` **note** weird name

check usage with `sudo df -h` and check `/dev/sda1`

if we ever reach 100% disk space, `docker` "drives itself into a hole that it can't get out of"

there's a `docker` config file that it tries to write to and if it can't write to it, so it leaves it as an empty file, and then can't recover from it

run this crazy command from spotify

```
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v /etc:/etc spotify/docker-gc
```

this takes a little while to run depending on usage

if there is a message about an erroneous configuration file, try deleting `.dockercfg` and then running

```
sudo service docker restart
```

#### (6) status is myseteriously down

sometimes the status checkers show they are down, but builds are building and launching successfully

might just mean the health checker needs to be restarted

log in with `gcloud compute ssh andrew@binder-web-deploy --zone=us-central1-f`

check running processes with `pm2 list`

get the current API key (**important**)

call

```
binder-control health stop
```

then restart with


```
binder-control health start --api-key=***
```
