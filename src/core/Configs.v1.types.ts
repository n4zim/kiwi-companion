
enum PathType { WORKSPACE, REPOSITORY }

// ----------------------------------------------------------------------------

interface RepositoryPath {
  type: PathType
  workspaces?: string[]
  pid?: number
}

interface WorkspacePath {
  type: PathType
  repositories?: string[]
}

// ----------------------------------------------------------------------------

interface ConfigsObject {
  version: number
  paths: { [path: string]: RepositoryPath & WorkspacePath }
}

interface WorkspaceObject {
  version: number
  name: string
  repositories: string[]
}
