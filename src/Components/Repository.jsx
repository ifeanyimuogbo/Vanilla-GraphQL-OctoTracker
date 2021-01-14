import Issues from "./Issues";
const Repository = ({ repository, onFetchMoreIssues, onStarRepository }) => (
  <div>
    <p>
      <strong>In Repository: </strong>
      <a href={repository.url}>{repository.name}</a>
      <button
        type="button"
        onClick={() =>
          onStarRepository(repository.id, repository.viewerHasStarred)
        }
      >
        {repository.stargazers.totalCount}{" "}
        {repository.viewerHasStarred ? "Unstar" : "Star"}
      </button>
      <Issues
        issues={repository.issues}
        onFetchMoreIssues={onFetchMoreIssues}
      />
    </p>
  </div>
);
export default Repository;
