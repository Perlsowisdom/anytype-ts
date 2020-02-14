import { I, keyboard } from 'ts/lib';
import { getRange, setRange } from 'selection-ranges';

const $ = require('jquery');

class Focus {
	
	block: boolean = false;
	focused: string = '';
	range: I.TextRange = { from: 0, to: 0 };
	
	set (id: string, range: I.TextRange): void {
		if (!range || this.block) {
			return;
		};
		
		this.focused = String(id || '');
		this.range.from = Number(range.from) || 0;
		this.range.to = Number(range.to) || 0;
	};
	
	clear () {
		this.focused = '';
		this.range.from = 0;
		this.range.to = 0;
		window.getSelection().empty();
	};
	
	apply () {
		if (!this.focused) {
			return;
		};
		
		let el = $('#block-' + $.escapeSelector(this.focused));
		if (!el.length) {
			return;
		};
		
		let value = el.find('.value');
		if (!value.length) {
			return;
		};
		
		value.focus();
		setRange(value.get(0), { start: this.range.from, end: this.range.to });
		keyboard.setFocus(true);
	};
	
	setBlock (v: boolean) {
		this.block = v;
	};
	
};

export let focus: Focus = new Focus();