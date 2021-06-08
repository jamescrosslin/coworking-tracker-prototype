const events = new EventSource('http://localhost:3000/tasks');

events.onmessage = (event) => {
  const parsedData = JSON.parse(event.data);

  document.getElementById('taskList').innerHTML = parsedData.reduce(
    (html, task) =>
      html +
      `
    <li class=${task.finished && 'done'} >
    <span>  ${task.id} </span>
    <span> -  ${task.user} </span>
    <span> -  ${task.task} </span>
    </li>
  `,
    '',
  );
};
