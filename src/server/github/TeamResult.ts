export interface GitHubTeamResult {
    data: GitHubTeamDataResult
}

export interface GitHubTeamDataResult {
    organization: OrganizationGraphQL
}

export interface OrganizationGraphQL {
    teams: TeamsObjectGraphQL
}

export interface TeamsObjectGraphQL {
    edges: TeamGraphQL[]
}

export interface TeamGraphQL {
    node: TeamNodeGraphQL
}

export interface TeamNodeGraphQL {
    name: string
}
