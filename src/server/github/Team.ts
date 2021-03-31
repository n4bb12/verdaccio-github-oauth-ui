import got from "got"

export interface IMemberNode {
  node: {
    name: string;
    slug: string;
  };
}

export interface IResponseData {
  data: {
    organization: {
      teams: {
        totalCount: number;
        pageInfo: {
          hasNextPage: boolean;
          endCursor: string;
        };
        edges: Array<IMemberNode>;
      }
    }
  }
}

export async function  getTeamsByUser( username: string, org: string, graphqlBaseUrl: string, endCursor: string, accessToken: string): Promise<IResponseData> {
    const url = graphqlBaseUrl + "/graphql"
    const queryParams = [`userLogins: ["${username}"]`]
    const paginationCount = 100
    if (endCursor) {
      queryParams.push(`after: "${endCursor}"`);
    }
    const pagination = `first: ${paginationCount}`
    const query = `{ 
          organization(login: "${org}") { 
            teams(${[pagination, ...queryParams].join(', ')}) { 
              totalCount 
              edges { 
                node {
                  name 
                  slug 
                } 
              } 
              pageInfo { 
                hasNextPage 
                endCursor 
              } 
            } 
          } 
        }`
    /*logger.log("Query: "+query)*/
    const options = {
      method: "POST",
      json: {
        query: query.replace(/[\n\r]/g, '')
      },
      headers: {
        Authorization: "Bearer " + accessToken,
      },
      responseType: 'json'
    } as const

    try {
          const data = await got(url, options).json()
          return data

    } catch (error) {
          throw new Error("Failed requesting GitHub user orgs: " + error.message)
    }
  }

