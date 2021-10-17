import {emptyItemQuery} from './item.js';

export default class Controller {

	constructor(store, view) {
		this.store = store;
		this.view = view;

		view.bindAddItem(this.addItem.bind(this));
		view.bindEditItemSave(this.editItemSave.bind(this));
		view.bindEditItemCancel(this.editItemCancel.bind(this));
		view.bindRemoveItem(this.removeItem.bind(this));
		view.bindToggleItem((id, completed) => {
			this.toggleCompleted(id, completed);
			this._filter();
		});
		view.bindRemoveCompleted(this.removeCompletedItems.bind(this));
		view.bindToggleAll(this.toggleAll.bind(this));

		this._activeRoute = '';
		this._lastActiveRoute = null;
	}

	setView(raw) {
		const route = raw.replace(/^#\//, '');
		this._activeRoute = route;
		this._filter();
		this.view.updateFilterButtons(route);
	}

	addItem(title) {
		/***  Task 02 - prevent duplicate ToDo titles ***/ 
		// console.log('current todos: ', todos);
		let todos = this.store.getLocalStorage();
		let found = todos.find(item => item.title == title);

		if(!found){
			/***  Task 10 - remove '<>' from title ***/ 
			let fixTitle = title;
			fixTitle = fixTitle?.replace(/</g, "");
			fixTitle = fixTitle?.replace(/>/g, "");
			// console.log('title = ', title);
			// console.log('fixTitle = ', fixTitle);

			this.store.insert({
				id: Date.now(),
				title: fixTitle,
				completed: false
			}, () => {
				this.view.clearNewTodo();
				this._filter(true);
			});
		}
		else{
			alert("You already have that task, no need to add it again ;)");
		}
	}

	editItemSave(id, title) {
		if (title.length) {
			this.store.update({id, title}, () => {
				this.view.editItemDone(id, title);
			});
		} else {
			this.removeItem(id);
		}
	}

	editItemCancel(id) {
		this.store.find({id}, data => {
			const title = data[0].title;
			this.view.editItemDone(id, title);
		});
	}

	removeItem(id) {
		this.store.remove({id}, () => {
			this._filter();
			this.view.removeItem(id);
		});
	}

	removeCompletedItems() {
		this.store.remove({completed: true}, this._filter.bind(this));
	}

	toggleCompleted(id, completed) {
		this.store.update({id, completed}, () => {
			this.view.setItemComplete(id, completed);
		});
	}

	toggleAll(completed) {
		this.store.find({completed: !completed}, data => {
			for (let {id} of data) {
				this.toggleCompleted(id, completed);
			}
		});

		this._filter();
	}

	_filter(force) {
		const route = this._activeRoute;

		if (force || this._lastActiveRoute !== '' || this._lastActiveRoute !== route) {
			this.store.find({
				'': emptyItemQuery,
				'active': {completed: false},
				'completed': {completed: true}
			}[route], this.view.showItems.bind(this.view));
		}

		this.store.count((total, active, completed) => {
			this.view.setItemsLeft(total);
			this.view.setClearCompletedButtonVisibility(completed);

			this.view.setCompleteAllCheckbox(completed === total);
			this.view.setMainVisibility(total);
		});

		this._lastActiveRoute = route;
	}
}
