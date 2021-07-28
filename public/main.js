const events = new EventSource(`${window.location}tasks`);

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

setInterval(() => {
  fetch(`${window.location}ping`)
    .then((res) => res.json())
    .then(console.log);
}, 1.8e6);
