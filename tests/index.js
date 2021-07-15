const tasksTests = {
  user: 'theDabolical',
  task: 'test task',
  apiKey: process.env.apiKey,
  params: new URLSearchParams({ user: this.user, apiKey: this.apiKey, task: this.task }),
  async getFetch(url) {
    const response = await fetch(url);
    const data = await response.json();
    console.log(data);
    return data;
  },
  async addTask() {
    await this.getFetch(
      `http://localhost:3000/tasks/createTask?user=${this.user}&task=${this.task}&key=${this.apiKey}`,
    );
  },
  async finishTask() {
    await this.getFetch(
      `http://localhost:3000/tasks/finishTask?user=${this.user}&key=${this.apiKey}`,
    );
  },
  async deleteTask(id) {
    await this.getFetch(
      `http://localhost:3000/tasks/deleteTask?user=${this.user}&key=${this.apiKey}&id=${id}`,
    );
  },
};

module.exports = tasksTests;
