const Reactions = ({ reactions }) => (
  <ul>
    {reactions.edges.map((reaction) => (
      <li key={reaction.node.id}>{reaction.node.content}</li>
    ))}
  </ul>
);

export default Reactions;
