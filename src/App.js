import "./App.css";
import axios from "axios";
import { useState, useEffect } from "react";
import Organization from "./Components/Organization";

const octoTrackerGraphQL = axios.create({
  baseURL: "https://api.github.com/graphql",
  headers: {
    Authorization: `bearer ${process.env.REACT_APP_GITHUB_PERSONAL_ACCESS_TOKEN}`,
  },
});

const GET_ISSUES_OF_REPOSITORY = `
query ($organization: String!, $repository: String!, $cursor: String){
  organization(login: $organization) {
    name
    url
    repository(name: $repository) {
      id
      name
      url
      stargazers {
        totalCount
      }
      viewerHasStarred
      issues(first: 5, after: $cursor, states: [OPEN]) {
        edges {
          node {
            id
            title
            url
            reactions(last: 3) {
              edges {
                node {
                  id
                  content
                }
              }
            }
          }
        }
        totalCount
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  }
}`;
const ADD_STAR = `
mutation ($repositoryId: ID!) {
  addStar (input: {starrableId: $repositoryId}) {
    starrable {
      viewerHasStarred
    }
  }
}`;
const REMOVE_STAR = `
mutation ($repositoryId: ID!) {
  removeStar (input: {starrableId: $repositoryId}) {
    starrable {
      viewerHasStarred
    }
  }
}`;

const getIssuesOfRepository = (path, cursor) => {
  const [organization, repository] = path.split("/");
  return octoTrackerGraphQL.post("", {
    query: GET_ISSUES_OF_REPOSITORY,
    variables: { organization, repository, cursor },
  });
};
const addStarToRepository = (repositoryId) => {
  return octoTrackerGraphQL.post("", {
    query: ADD_STAR,
    variables: { repositoryId },
  });
};
const removeStarFromRepository = (repositoryId) => {
  return octoTrackerGraphQL.post("", {
    query: REMOVE_STAR,
    variables: { repositoryId },
  });
};

function App() {
  const [path, setPath] = useState(
    "the-road-to-learn-react/the-road-to-learn-react"
  );
  const [organization, setOrganization] = useState(null);
  const [errors, setErrors] = useState(null);
  useEffect(() => {
    fetchFromGithub(path);
  }, []);
  const fetchFromGithub = (path, cursor) => {
    getIssuesOfRepository(path, cursor).then((result) => {
      if (!cursor) {
        setOrganization(result.data.data.organization);
        setErrors(result.data.errors);
      } else {
        const { edges: oldIssues } = organization.repository.issues;
        const {
          edges: newIssues,
        } = result.data.data.organization.repository.issues;
        const updatedIssues = [...oldIssues, ...newIssues];
        setOrganization({
          ...result.data.data.organization,
          repository: {
            ...result.data.data.organization.repository,
            issues: {
              ...result.data.data.organization.repository.issues,
              edges: updatedIssues,
            },
          },
        });
        setErrors(result.data.errors);
      }
    });
  };

  const TITLE = "Octo Tracker";
  const onSubmit = (e) => {
    fetchFromGithub(path);
    e.preventDefault();
  };
  const onChange = (e) => {
    setPath(e.target.value);
  };
  const onFetchMoreIssues = () => {
    console.log("clicked");
    const { endCursor } = organization.repository.issues.pageInfo;
    fetchFromGithub(path, endCursor);
  };
  const onStarRepository = (repositoryId, viewerHasStarred) => {
    if (!viewerHasStarred) {
      addStarToRepository(repositoryId).then((mutationResult) => {
        setOrganization({
          ...organization,
          repository: {
            ...organization.repository,
            viewerHasStarred:
              mutationResult.data.data.addStar.starrable.viewerHasStarred,
            stargazers: {
              totalCount: organization.repository.stargazers.totalCount + 1,
            },
          },
        });
      });
    } else {
      removeStarFromRepository(repositoryId).then((mutationResult) => {
        setOrganization({
          ...organization,
          repository: {
            ...organization.repository,
            viewerHasStarred:
              mutationResult.data.data.removeStar.starrable.viewerHasStarred,
            stargazers: {
              totalCount: organization.repository.stargazers.totalCount - 1,
            },
          },
        });
      });
    }
  };
  return (
    <div>
      <h1>{TITLE}</h1>
      <form onSubmit={onSubmit}>
        <label htmlFor="url">Show open issues for https://github.com/</label>
        <input
          id="url"
          type="text"
          value={path}
          onChange={onChange}
          style={{ width: "300px" }}
        />
        <button type="submit">Search</button>
      </form>
      <hr />

      {organization ? (
        <Organization
          organization={organization}
          errors={errors}
          onFetchMoreIssues={onFetchMoreIssues}
          onStarRepository={onStarRepository}
        />
      ) : (
        <p>No information yet ...</p>
      )}
    </div>
  );
}

export default App;
