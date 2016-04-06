# api docs

The Binder HTTP API consists of endpoints for building, launching, and querying the status of 
binders. A complete description of the API, including error conditions 
(and recommended fixes), can be found in
[`binder-protocol`](https://github.com/binder-project/binder-protocol/blob/master/index.js)

If you'd like to construct a binder from a GitHub repository, or you'd like to check on the status
of an existing build, you should use the [`build`](#build) API. Once an image has been built, a
piece of metadata called a _template_ is constructed which describes how to deploy that image onto a
cluster. To see the contents of a single template, or to fetch all stored templates, use the 
[`registry`](#registry) API. To deploy a template onto a cluster, or to check on the status of a 
deployment, use the [`deploy`](#Deploy) API.

We provide a [client package](https://github.com/binder-project/binder-client) that wraps HTTP API 
and can be used either from the command line or as an imported NodeJS module.

### build

Start a new build

```
POST /builds/repo HTTP 1.1
Content-Type: application/json
Authorization: 880df8bbabdf4b48f412208938c220fe
{
  "repository": "https://github.com/binder-project/example-requirements"
}

```
*returns*
```
{
  "name": "binder-project-example-requirements",
  "repo": "https://github.com/binder-project/example-requirements",
  "phase": "fetching",
  "status": "running",
  "start-time": "2016-03-25T05:42:47.315Z"
}
```

--------------------------------

Get the status of all builds
```
GET /builds/ HTTP 1.1
Authorization: 880df8bbabdf4b48f412208938c220fe
```

*returns*

```
 [
  {
    "name": "binder-project-example-requirements",
    "start-time": "2016-03-25T05:42:47.315Z",
    "status": "completed",
    "phase": "finished",
    "repository": "http://github.com/binder-project/example-requirements"
  },
  ...
  {
    "name": "binder-project-example-dockerfile",
    "start-time": "2016-03-25T03:48:29.635Z",
    "status": "completed",
    "phase": "finished",
    "repository": "http://github.com/binder-project/example-dockerfile"
  }
]
```

-------------------------------------

Get the status of a single build
```
GET /builds/binder-project-example-requirements HTTP 1.1
```

*returns*

```
{
  "name": "binder-project-example-requirements",
  "start-time": "2016-03-25T05:42:47.315Z",
  "status": "completed",
  "phase": "finished",
  "repository": "http://github.com/binder-project/example-requirements"
}
```

### registry

Get all templates

```
GET /templates/ HTTP 1.1
Authorization: 880df8bbabdf4b48f412208938c220fe
```

*returns*

```
[
  {
    "port": 8888,
    "image-source": "gcr.io/binder-testing/binder-project-example-requirements",
    "name": "binder-project-example-requirements",
    "image-name": "binder-project-example-requirements",
    "command": [],
    "time-modified": "2016-03-28T18:55:54.631Z",
    "time-created": "2016-03-28T18:55:54.631Z",
    "services": []
  },
  {
    "port": 8888,
    "image-source": "gcr.io/binder-testing/binder-project-example-dockerfile",
    "name": "binder-project-example-dockerfile",
    "image-name": "binder-project-example-dockerfile",
    "command": [],
    "time-modified": "2016-03-28T18:55:54.632Z",
    "time-created": "2016-03-28T18:55:54.632Z",
    "services": []
  }
]
```

----------------------------

Get a single template

```
GET /templates/binder-project-example-requirements HTTP 1.1
```

*returns*

```
{
  "port": 8888,
  "image-source": "gcr.io/binder-testing/binder-project-example-dockerfile",
  "name": "binder-project-example-dockerfile",
  "image-name": "binder-project-example-dockerfile",
  "command": [],
  "time-modified": "2016-03-28T18:55:54.632Z",
  "time-created": "2016-03-28T18:55:54.632Z",
  "services": []
}
```
---------------------------------------------

### deploy

Get the status of a single deployed template with a given ID

```
GET /applications/binder-project-example-requirements/84b8f9e8d573e73016fa2c14bad86a4d HTTP 1.1
```

*returns*

```
{
  "id": "84b8f9e8d573e73016fa2c14bad86a4d",
  "template-name": "binder-project-example-requirements",
  "location": "104.197.56.211/user/84b8f9e8d573e73016fa2c14bad86a4d",
  "status": "deleted"
}
```
------------------------------

Get the status of all deployed templates for a template name

```
GET /applications/binder-project-example-requirements HTTP 1.1
Authorization: 880df8bbabdf4b48f412208938c220fe
```

*returns*

```
[
  {
    "id": "74156d847a6bc8e07c64a43aaed53514",
    "template-name": "binder-project-example-requirements",
    "location": "104.197.56.211/user/74156d847a6bc8e07c64a43aaed53514",
    "status": "deleted"
  },
  ...
  {
    "id": "880aa1c3798c32ad6fc120267e3ae610",
    "template-name": "binder-project-example-requirements",
    "location": "104.197.56.211/user/880aa1c3798c32ad6fc120267e3ae610",
    "status": "deleted"
  }
]
```
-------------------------------

Launch a new instance of a template

```
POST /applications/binder-project-example-requirements
Content-Type: application/json
```

*returns*

```
{
  "id": "a16653059942e2ef2b1c7b458d6a2463"
}
```
--------------------------------

