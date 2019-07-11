
export enum PathType { WORKSPACE, REPOSITORY }

// ----------------------------------------------------------------------------

export interface RepositoryPath {
  type: PathType
  workspaces?: string[]
  pid?: number
}

export interface WorkspacePath {
  type: PathType
  repositories?: string[]
}

// ----------------------------------------------------------------------------

export interface ConfigsObject {
  version: number
  paths: { [path: string]: RepositoryPath & WorkspacePath }
}

export interface WorkspaceObject {
  version: number
  name: string
  repositories: string[]
}
