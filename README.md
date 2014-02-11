pomelo-protobuf-plugin
====================

pomelo-protobuf-plugin is a plugin for pomelo, it can be used in pomelo(>=0.9).

pomelo-protobuf-plugin provides messages encode&decode service for pomelo, and it uses [ProtoBuf.js](https://github.com/dcodeIO/ProtoBuf.js) to do this thing.

##Installation

```
npm install pomelo-protobuf-plugin
```

##Usage

the protos file should use json format, for it would be compatible for pomelo-protobuf. If you use proto file, you can use ProtoBuf.js to turn it to json file.

the default protos files are /config/serversProtos.json and /config/clientProtos.json, and you can specify your own protos files.


```
var protobuf = require('pomelo-protobuf-plugin');

	app.use(protobuf, {
		protobuf: {
			// serverProtos: /yourprotofilepath/
			// clientProtos: /yourprotofilepath/
		}
	});

```
