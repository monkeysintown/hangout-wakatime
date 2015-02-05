## Build

```
npm install
```

```
gulp build
```

NOTE:

The ZIP file in the dist directory is just for convenience in case multiple artifacts are published on a server. This
gadget file (wakatime.xml) is self containing (everything is inlined); easier to handle.

## Hangout Integration

### Dev Console

https://developers.google.com/+/hangouts/publishing#dev-console

NOTE:

At the moment it's a bit confusing; the new UI doesn't seem to be complete; some tasks had to be done with old one.

### Install

The gadget doesn't have to be public. If you've finished the process with the dev console you'll see it in your Hangout
widget list (dev category).

### Note

The URL that I am using points to the raw Github file (https://raw.../wakatime.xml). This is just for testing. Ultimately
it should be hosted on a proper server.