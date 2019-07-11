
enum PathType { WORKSPACE, REPOSITORY }

interface WorkspacePath {
  type: PathType.WORKSPACE
  repositories: string[]
}

interface RepositoryPath {
  type: PathType.REPOSITORY
  workspaces: string[]
  pid?: number
}

interface ConfigsType {
  version: number
  paths: { [path: string]: RepositoryPath|WorkspacePath }
}

interface Workspace {
  version: number
  name: string
  repositories: string[]
}
