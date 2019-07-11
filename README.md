
# Kiwi Bundle CLI


## Install
```bash
npm install -g kiwi-bundle-cli
```


## Start a new project
* Kiwi Bundle : `kiwi init` (TODO)
* TypeScript : `kiwi init -t=typescript` (TODO)
* Empty : `kiwi init -t=empty` (TODO)



## NPM commands

### Install dependencies packages (TODO)
```bash
kiwi install
```

### Add new packages
* Save on "dependencies" : `kiwi add [PACKAGES NAMES...]` (TODO)
* Save on "devDependencies" : `kiwi add --dev [PACKAGES NAMES...]` (TODO)
* Save on "optionalDependencies" : `kiwi add --optional [PACKAGES NAMES...]` (TODO)

### Remove packages (TODO)
```bash
kiwi remove [PACKAGES NAMES...]
```


## Node commands

### Start in development mode on a background task (TODO)
```bash
kiwi start
```

### See outputs of the currently launched process(es) (TODO)
```bash
kiwi logs
```

### Stop background task(s) (TODO)
```bash
kiwi stop
```

### Build for production (TODO)
```bash
kiwi build
```

### Launch package(s) tests (TODO)
```bash
kiwi test
```


## Git commands

There are two different levels :
- inside a repository
- inside a Kiwi Workspace (will act for each repository inside)

### Current status (TODO)
```bash
kiwi status
```

### Add new enhancement (TODO)
```bash
kiwi enhancements new
```

### List current enhancements (TODO)
```bash
kiwi enhancements list
```

### Add to current enhancement (TODO)
```bash
kiwi enhancements update
```

### Send local enhancements (TODO)
```bash
kiwi enhancements push
```

### Receive remote enhancements (TODO)
```bash
kiwi enhancements pull
```

### Merge current enhancements (TODO)
```bash
kiwi enhancements finish
```

### Merge to master (TODO)
```bash
kiwi versions add
```
