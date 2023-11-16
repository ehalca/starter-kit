# starter-kit

## Getting Started

### API

#### Debugging API
add to `wepback.config.js`:
```
config.output.devtoolModuleFilenameTemplate = function (info) {
    const rel = path.relative(process.cwd(), info.absoluteResourcePath);
    return `webpack:///./${rel}`;
  };
```

#### Running
Add script to package json:
```
"debug:api": "nx serve api",
```