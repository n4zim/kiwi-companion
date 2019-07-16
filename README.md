
# Kiwi Companion


## Install
```bash
npm install -g kiwi-companion
```


## Projects

## Start a new project
* Kiwi Bundle : `kiwi project new` (TODO)
* TypeScript : `kiwi project new -t=typescript` (TODO)
* Empty : `kiwi project new -t=empty` (TODO)

### Install dependencies packages
```bash
kiwi project [PROJECT] install
```

## NPM commands




### Add new package(s)
* Save on "dependencies" : `kiwi add [PACKAGES NAMES...]`
* Save on "devDependencies" : `kiwi add --dev [PACKAGES NAMES...]`
* Save on "optionalDependencies" : `kiwi add --optional [PACKAGES NAMES...]`

### Remove package(s)
```bash
kiwi remove [PACKAGES NAMES...]
```


## Node commands

### Start in development mode
```bash
kiwi start
```

### Build for production (TODO)
```bash
kiwi build
```

### Launch package(s) tests (TODO)
```bash
kiwi test
```


## Workspaces commands

### Add from Kiwi Recipes
```bash
kiwi workspaces import [RECIPE SLUG]
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
