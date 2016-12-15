"use strict";

module.exports = class Barrier {

	constructor(numberOfTasks) {
		this.numberOfTasks = numberOfTasks;
		this.callback = () => {};
		this.finishedTasks = [];
	}

	then(callback) {
		this.callback = callback;
		return this;
	}

	waitingFor() {
		return this.numberOfTasks - this.finishedTasks.length;
	}

	finishedTask(task) {
		if (!this.isFinished(task)) {
			this.finishedTasks.push(task);
			if (this.numberOfTasks <= this.finishedTasks.length) {
				this.callback();
			}
		}
		return this;
	}

	expand(amount) {
		this.numberOfTasks += amount;
		return this;
	}

	isFinished(task) {
		return this.finishedTasks.indexOf(task) >= 0;
	}
}
