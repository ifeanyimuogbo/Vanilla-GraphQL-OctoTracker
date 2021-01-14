import Reactions from "./Reactions";
const Issues = ({ issues, onFetchMoreIssues }) => (
  <>
    <ul>
      {issues.edges.map((issue) => (
        <li key={issue.node.id}>
          <a href={issue.node.url}>{issue.node.title}</a>
          <Reactions reactions={issue.node.reactions} />
        </li>
      ))}
    </ul>
    <hr />
    {issues.pageInfo.hasNextPage && (
      <button onClick={onFetchMoreIssues}>More</button>
    )}
  </>
);
export default Issues;
